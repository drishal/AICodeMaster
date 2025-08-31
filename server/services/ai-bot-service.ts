import { spawn, ChildProcess } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { EventEmitter } from 'events';

interface BotConfig {
  id: string;
  name: string;
  type: 'assistant' | 'automation' | 'chatbot' | 'api';
  model: string;
  personality: string;
  instructions: string;
  capabilities: string[];
  integrations: string[];
  status: 'active' | 'inactive' | 'training' | 'error';
}

interface BotInstance {
  config: BotConfig;
  process?: ChildProcess;
  lastActivity: Date;
  interactions: number;
  errors: number;
}

interface BotMessage {
  botId: string;
  message: string;
  context?: any;
  timestamp: Date;
}

interface BotResponse {
  success: boolean;
  response?: string;
  error?: string;
  usage?: {
    tokens: number;
    cost: number;
  };
}

export class AIBotService extends EventEmitter {
  private bots: Map<string, BotInstance> = new Map();
  private botDir: string;
  private isRunning: boolean = false;

  constructor() {
    super();
    this.botDir = path.join(process.cwd(), 'bots');
    this.ensureBotDirectory();
  }

  private async ensureBotDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.botDir, { recursive: true });
      await fs.mkdir(path.join(this.botDir, 'configs'), { recursive: true });
      await fs.mkdir(path.join(this.botDir, 'logs'), { recursive: true });
      await fs.mkdir(path.join(this.botDir, 'training'), { recursive: true });
    } catch (error) {
      console.error('Failed to create bot directories:', error);
    }
  }

  async createBot(config: Omit<BotConfig, 'id' | 'status'>): Promise<{ success: boolean; botId?: string; error?: string }> {
    try {
      const botId = this.generateBotId();
      const fullConfig: BotConfig = {
        ...config,
        id: botId,
        status: 'inactive'
      };

      // Save bot configuration
      const configPath = path.join(this.botDir, 'configs', `${botId}.json`);
      await fs.writeFile(configPath, JSON.stringify(fullConfig, null, 2));

      // Create bot instance
      const instance: BotInstance = {
        config: fullConfig,
        lastActivity: new Date(),
        interactions: 0,
        errors: 0
      };

      this.bots.set(botId, instance);

      // Create bot training data directory
      await fs.mkdir(path.join(this.botDir, 'training', botId), { recursive: true });

      // Log bot creation
      await this.logBotActivity(botId, 'created', { config: fullConfig });

      this.emit('botCreated', { botId, config: fullConfig });

      return { success: true, botId };
    } catch (error) {
      console.error('Bot creation failed:', error);
      return { success: false, error: error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error) };
    }
  }

  async loadBot(botId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const configPath = path.join(this.botDir, 'configs', `${botId}.json`);
      const configContent = await fs.readFile(configPath, 'utf-8');
      const config: BotConfig = JSON.parse(configContent);

      const instance: BotInstance = {
        config,
        lastActivity: new Date(),
        interactions: 0,
        errors: 0
      };

      this.bots.set(botId, instance);
      return { success: true };
    } catch (error) {
      console.error(`Failed to load bot ${botId}:`, error);
      return { success: false, error: error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error) };
    }
  }

  async startBot(botId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const instance = this.bots.get(botId);
      if (!instance) {
        return { success: false, error: 'Bot not found' };
      }

      if (instance.config.status === 'active') {
        return { success: true }; // Already running
      }

      // Update status
      instance.config.status = 'active';
      await this.updateBotConfig(botId, instance.config);

      // Initialize bot based on type
      switch (instance.config.type) {
        case 'assistant':
          await this.startAssistantBot(instance);
          break;
        case 'automation':
          await this.startAutomationBot(instance);
          break;
        case 'chatbot':
          await this.startChatBot(instance);
          break;
        case 'api':
          await this.startAPIBot(instance);
          break;
      }

      await this.logBotActivity(botId, 'started');
      this.emit('botStarted', { botId, config: instance.config });

      return { success: true };
    } catch (error) {
      console.error(`Failed to start bot ${botId}:`, error);
      return { success: false, error: error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error) };
    }
  }

  async stopBot(botId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const instance = this.bots.get(botId);
      if (!instance) {
        return { success: false, error: 'Bot not found' };
      }

      if (instance.process) {
        instance.process.kill('SIGTERM');
        instance.process = undefined;
      }

      instance.config.status = 'inactive';
      await this.updateBotConfig(botId, instance.config);

      await this.logBotActivity(botId, 'stopped');
      this.emit('botStopped', { botId, config: instance.config });

      return { success: true };
    } catch (error) {
      console.error(`Failed to stop bot ${botId}:`, error);
      return { success: false, error: error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error) };
    }
  }

  async sendMessage(botId: string, message: string, context?: any): Promise<BotResponse> {
    try {
      const instance = this.bots.get(botId);
      if (!instance) {
        return { success: false, error: 'Bot not found' };
      }

      if (instance.config.status !== 'active') {
        return { success: false, error: 'Bot is not active' };
      }

      // Update activity tracking
      instance.lastActivity = new Date();
      instance.interactions++;

      // Process message based on bot type and model
      const response = await this.processMessage(instance, message, context);

      // Log interaction
      await this.logBotActivity(botId, 'interaction', {
        message,
        response: response.response,
        context
      });

      this.emit('botInteraction', { botId, message, response });

      return response;
    } catch (error) {
      console.error(`Message processing failed for bot ${botId}:`, error);
      
      const instance = this.bots.get(botId);
      if (instance) {
        instance.errors++;
      }

      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  private async processMessage(instance: BotInstance, message: string, context?: any): Promise<BotResponse> {
    const { config } = instance;
    
    // Create prompt based on bot configuration
    const systemPrompt = this.buildSystemPrompt(config);
    const userMessage = this.formatUserMessage(message, context);

    // Mock AI response - in production, this would integrate with actual AI APIs
    const mockResponse = await this.generateAIResponse(systemPrompt, userMessage, config.model);

    return {
      success: true,
      response: mockResponse,
      usage: {
        tokens: mockResponse.length / 4, // Rough token estimate
        cost: 0.001 // Mock cost
      }
    };
  }

  private buildSystemPrompt(config: BotConfig): string {
    let prompt = `You are ${config.name}, ${config.type} with ${config.personality} personality.\n\n`;
    
    prompt += `Your primary instructions:\n${config.instructions}\n\n`;
    
    if (config.capabilities.length > 0) {
      prompt += `Your capabilities include: ${config.capabilities.join(', ')}\n\n`;
    }

    if (config.integrations.length > 0) {
      prompt += `You have access to these integrations: ${config.integrations.join(', ')}\n\n`;
    }

    // Add type-specific instructions
    switch (config.type) {
      case 'assistant':
        prompt += 'Provide helpful, accurate assistance while being professional and informative.';
        break;
      case 'automation':
        prompt += 'Focus on automating tasks efficiently and provide clear status updates.';
        break;
      case 'chatbot':
        prompt += 'Engage in natural conversation while providing helpful responses.';
        break;
      case 'api':
        prompt += 'Process API requests and provide structured responses.';
        break;
    }

    return prompt;
  }

  private formatUserMessage(message: string, context?: any): string {
    let formattedMessage = message;
    
    if (context) {
      formattedMessage += `\n\nContext: ${JSON.stringify(context, null, 2)}`;
    }

    return formattedMessage;
  }

  private async generateAIResponse(systemPrompt: string, userMessage: string, model: string): Promise<string> {
    // Mock AI response generation
    // In production, this would integrate with OpenAI, Anthropic, etc.
    
    const responses = [
      "I understand your request and I'm here to help. Let me process that for you.",
      "Based on the information provided, I can assist you with this task.",
      "I'm analyzing your request and will provide a comprehensive response.",
      "Thank you for your message. I'm processing this according to my training.",
      "I'm ready to help you with this. Let me provide the best possible assistance."
    ];

    // Simple response selection based on message content
    const selectedResponse = responses[Math.floor(Math.random() * responses.length)];
    
    // Add some context-aware elements
    if (userMessage.toLowerCase().includes('code')) {
      return `${selectedResponse} I can help you with coding tasks, debugging, and development questions.`;
    } else if (userMessage.toLowerCase().includes('create')) {
      return `${selectedResponse} I'll help you create what you need step by step.`;
    } else {
      return selectedResponse;
    }
  }

  private async startAssistantBot(instance: BotInstance): Promise<void> {
    // Initialize assistant bot - could start background processes, connect to services, etc.
    console.log(`Starting assistant bot: ${instance.config.name}`);
  }

  private async startAutomationBot(instance: BotInstance): Promise<void> {
    // Initialize automation bot - set up task scheduling, monitoring, etc.
    console.log(`Starting automation bot: ${instance.config.name}`);
  }

  private async startChatBot(instance: BotInstance): Promise<void> {
    // Initialize chat bot - connect to messaging platforms, set up webhooks, etc.
    console.log(`Starting chat bot: ${instance.config.name}`);
  }

  private async startAPIBot(instance: BotInstance): Promise<void> {
    // Initialize API bot - set up endpoints, API monitoring, etc.
    console.log(`Starting API bot: ${instance.config.name}`);
  }

  async getBotStatus(botId: string): Promise<{ success: boolean; status?: any; error?: string }> {
    try {
      const instance = this.bots.get(botId);
      if (!instance) {
        return { success: false, error: 'Bot not found' };
      }

      const status = {
        id: botId,
        name: instance.config.name,
        type: instance.config.type,
        status: instance.config.status,
        lastActivity: instance.lastActivity,
        interactions: instance.interactions,
        errors: instance.errors,
        uptime: this.calculateUptime(instance),
        successRate: this.calculateSuccessRate(instance)
      };

      return { success: true, status };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  async listBots(): Promise<{ success: boolean; bots?: any[]; error?: string }> {
    try {
      const botList = Array.from(this.bots.values()).map(instance => ({
        id: instance.config.id,
        name: instance.config.name,
        type: instance.config.type,
        status: instance.config.status,
        lastActivity: instance.lastActivity,
        interactions: instance.interactions,
        successRate: this.calculateSuccessRate(instance)
      }));

      return { success: true, bots: botList };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  private async updateBotConfig(botId: string, config: BotConfig): Promise<void> {
    const configPath = path.join(this.botDir, 'configs', `${botId}.json`);
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
  }

  private async logBotActivity(botId: string, activity: string, data?: any): Promise<void> {
    const logEntry = {
      botId,
      activity,
      timestamp: new Date().toISOString(),
      data
    };

    const logPath = path.join(this.botDir, 'logs', `${botId}.log`);
    await fs.appendFile(logPath, JSON.stringify(logEntry) + '\n');
  }

  private calculateUptime(instance: BotInstance): string {
    // Mock uptime calculation
    return '99.5%';
  }

  private calculateSuccessRate(instance: BotInstance): number {
    if (instance.interactions === 0) return 100;
    return Math.max(0, ((instance.interactions - instance.errors) / instance.interactions) * 100);
  }

  private generateBotId(): string {
    return `bot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async trainBot(botId: string, trainingData: any[]): Promise<{ success: boolean; error?: string }> {
    try {
      const instance = this.bots.get(botId);
      if (!instance) {
        return { success: false, error: 'Bot not found' };
      }

      instance.config.status = 'training';
      await this.updateBotConfig(botId, instance.config);

      // Save training data
      const trainingPath = path.join(this.botDir, 'training', botId, 'data.json');
      await fs.writeFile(trainingPath, JSON.stringify(trainingData, null, 2));

      // Mock training process
      setTimeout(async () => {
        instance.config.status = 'active';
        await this.updateBotConfig(botId, instance.config);
        this.emit('botTrained', { botId, config: instance.config });
      }, 5000);

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  async deleteBot(botId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Stop bot if running
      await this.stopBot(botId);

      // Remove from memory
      this.bots.delete(botId);

      // Delete files
      const configPath = path.join(this.botDir, 'configs', `${botId}.json`);
      const logPath = path.join(this.botDir, 'logs', `${botId}.log`);
      const trainingDir = path.join(this.botDir, 'training', botId);

      await Promise.allSettled([
        fs.unlink(configPath),
        fs.unlink(logPath),
        fs.rmdir(trainingDir, { recursive: true })
      ]);

      this.emit('botDeleted', { botId });

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }
}

export const aiBotService = new AIBotService();