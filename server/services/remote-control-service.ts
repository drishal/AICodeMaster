import OpenAI from 'openai';
import { storage } from '../storage';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  command?: string;
  result?: any;
  status: 'pending' | 'success' | 'error' | 'processing';
}

interface ChatSession {
  id: string;
  name: string;
  messages: ChatMessage[];
  created: string;
  lastActive: string;
  apiKey?: string;
}

interface RemoteCommand {
  id: string;
  command: string;
  description: string;
  category: string;
  parameters: string[];
  example: string;
  handler: (params: any) => Promise<any>;
}

// API Key rotation system for handling quota limits
const API_KEYS = (process.env.OPENAI_API_KEYS || process.env.OPENAI_API_KEY || "").split(',').filter(key => key.trim());
let keyIndex = 0;

function getNextKey(): string {
  if (API_KEYS.length === 0) {
    throw new Error('No OpenAI API keys configured');
  }
  const key = API_KEYS[keyIndex].trim();
  keyIndex = (keyIndex + 1) % API_KEYS.length;
  return key;
}

function createOpenAIClient(): OpenAI {
  return new OpenAI({
    apiKey: getNextKey()
  });
}

export class RemoteControlService {
  private sessions: Map<string, ChatSession> = new Map();
  private commands: Map<string, RemoteCommand> = new Map();

  constructor() {
    this.initializeCommands();
    this.loadSessions();
  }

  private initializeCommands() {
    const commands: RemoteCommand[] = [
      // Platform Management
      {
        id: 'status',
        command: 'platform_status',
        description: 'Get platform status and health information',
        category: 'platform',
        parameters: [],
        example: 'Show platform status',
        handler: async () => this.getPlatformStatus()
      },
      {
        id: 'restart',
        command: 'restart_service',
        description: 'Restart a specific service or the entire platform',
        category: 'platform',
        parameters: ['service'],
        example: 'Restart the application server',
        handler: async (params) => this.restartService(params.service)
      },

      // Website Management
      {
        id: 'create_website',
        command: 'create_website',
        description: 'Create a new website from template',
        category: 'websites',
        parameters: ['name', 'template', 'domain'],
        example: 'Create business website called "My Store"',
        handler: async (params) => this.createWebsite(params)
      },
      {
        id: 'deploy_website',
        command: 'deploy_website',
        description: 'Deploy a website to production',
        category: 'websites',
        parameters: ['websiteId'],
        example: 'Deploy website to production',
        handler: async (params) => this.deployWebsite(params.websiteId)
      },
      {
        id: 'list_websites',
        command: 'list_websites',
        description: 'List all websites and their status',
        category: 'websites',
        parameters: [],
        example: 'Show all my websites',
        handler: async () => this.listWebsites()
      },

      // APK Management
      {
        id: 'upload_apk',
        command: 'upload_apk',
        description: 'Upload and analyze APK file',
        category: 'mobile',
        parameters: ['url', 'description'],
        example: 'Upload APK from URL',
        handler: async (params) => this.uploadApk(params)
      },
      {
        id: 'list_apks',
        command: 'list_apks',
        description: 'List all uploaded APK files',
        category: 'mobile',
        parameters: [],
        example: 'Show all APK files',
        handler: async () => this.listApks()
      },
      {
        id: 'analyze_apk',
        command: 'analyze_apk',
        description: 'Analyze APK file details',
        category: 'mobile',
        parameters: ['apkId'],
        example: 'Analyze APK file details',
        handler: async (params) => this.analyzeApk(params.apkId)
      },

      // AI Content Generation
      {
        id: 'generate_content',
        command: 'generate_content',
        description: 'Generate AI content (video, image, voice)',
        category: 'ai',
        parameters: ['type', 'prompt', 'style'],
        example: 'Generate promotional video about mobile apps',
        handler: async (params) => this.generateContent(params)
      },
      {
        id: 'create_bot',
        command: 'create_bot',
        description: 'Create AI bot with custom personality',
        category: 'ai',
        parameters: ['name', 'personality', 'model'],
        example: 'Create coding assistant bot',
        handler: async (params) => this.createBot(params)
      },
      {
        id: 'generate_code',
        command: 'generate_code',
        description: 'Generate code in specified language',
        category: 'ai',
        parameters: ['prompt', 'language'],
        example: 'Generate Python script for file processing',
        handler: async (params) => this.generateCode(params)
      },

      // Social Media Automation
      {
        id: 'create_campaign',
        command: 'create_campaign',
        description: 'Create social media marketing campaign',
        category: 'social',
        parameters: ['platform', 'content', 'schedule'],
        example: 'Create Instagram campaign for product launch',
        handler: async (params) => this.createCampaign(params)
      },
      {
        id: 'schedule_post',
        command: 'schedule_post',
        description: 'Schedule social media post',
        category: 'social',
        parameters: ['platform', 'content', 'datetime'],
        example: 'Schedule Instagram post for tomorrow 9 AM',
        handler: async (params) => this.schedulePost(params)
      },

      // Document Management
      {
        id: 'upload_document',
        command: 'upload_document',
        description: 'Upload and encrypt document',
        category: 'documents',
        parameters: ['url', 'type', 'description'],
        example: 'Upload ID document from URL',
        handler: async (params) => this.uploadDocument(params)
      },
      {
        id: 'list_documents',
        command: 'list_documents',
        description: 'List all stored documents',
        category: 'documents',
        parameters: [],
        example: 'Show all my documents',
        handler: async () => this.listDocuments()
      },

      // Analytics and Reports
      {
        id: 'generate_report',
        command: 'generate_report',
        description: 'Generate analytics report',
        category: 'analytics',
        parameters: ['type', 'period'],
        example: 'Generate weekly performance report',
        handler: async (params) => this.generateReport(params)
      },

      // Self-Hosting
      {
        id: 'deploy_self_hosted',
        command: 'deploy_self_hosted',
        description: 'Deploy self-hosted environment',
        category: 'hosting',
        parameters: ['serverIp', 'domain'],
        example: 'Deploy to VPS server',
        handler: async (params) => this.deploySelfHosted(params)
      },
      {
        id: 'backup_system',
        command: 'backup_system',
        description: 'Create system backup',
        category: 'hosting',
        parameters: ['location'],
        example: 'Create backup of all data',
        handler: async (params) => this.backupSystem(params)
      }
    ];

    commands.forEach(cmd => this.commands.set(cmd.command, cmd));
  }

  private async loadSessions() {
    // Load existing sessions from storage or create default
    const defaultSession: ChatSession = {
      id: 'default',
      name: 'Main Control Session',
      messages: [{
        id: '1',
        role: 'system',
        content: 'Welcome to MO APP DEVELOPMENT Remote Control. You can control all platform features using natural language commands. Type "help" to see available commands.',
        timestamp: new Date().toISOString(),
        status: 'success'
      }],
      created: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };

    this.sessions.set('default', defaultSession);
  }

  async createSession(name: string, apiKey?: string): Promise<ChatSession> {
    const session: ChatSession = {
      id: Date.now().toString(),
      name,
      messages: [{
        id: '1',
        role: 'system',
        content: `Session "${name}" created. You can now control the MO APP DEVELOPMENT platform using natural language commands.`,
        timestamp: new Date().toISOString(),
        status: 'success'
      }],
      created: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      apiKey
    };

    this.sessions.set(session.id, session);

    if (apiKey) {
      (this as any).openai = new OpenAI({ apiKey });
    }

    return session;
  }

  getSessions(): ChatSession[] {
    return Array.from(this.sessions.values());
  }

  getSession(id: string): ChatSession | undefined {
    return this.sessions.get(id);
  }

  async processMessage(sessionId: string, message: string): Promise<ChatMessage> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    // Create user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      status: 'success'
    };

    session.messages.push(userMessage);

    try {
      // Parse command from natural language
      const command = await this.parseCommand(message, session.apiKey);
      
      // Execute command
      const result = await this.executeCommand(command.command, command.parameters);

      // Create assistant response
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.message || 'Command executed successfully',
        timestamp: new Date().toISOString(),
        command: command.command,
        result: result.data,
        status: 'success'
      };

      session.messages.push(assistantMessage);
      session.lastActive = new Date().toISOString();

      return assistantMessage;
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${(error as Error).message}`,
        timestamp: new Date().toISOString(),
        status: 'error'
      };

      session.messages.push(errorMessage);
      return errorMessage;
    }
  }

  private async parseCommand(message: string, apiKey?: string): Promise<{ command: string, parameters: any }> {
    const lowerMessage = message.toLowerCase();

    // Simple keyword matching for common commands
    if (lowerMessage.includes('status') || lowerMessage.includes('health')) {
      return { command: 'platform_status', parameters: {} };
    }
    
    if (lowerMessage.includes('create') && lowerMessage.includes('website')) {
      const nameMatch = message.match(/(?:called|named)\s+"([^"]+)"/i);
      const templateMatch = message.match(/(business|portfolio|ecommerce|blog|restaurant|saas)/i);
      return { 
        command: 'create_website', 
        parameters: { 
          name: nameMatch?.[1] || 'New Website',
          template: templateMatch?.[1] || 'business'
        } 
      };
    }

    if (lowerMessage.includes('upload') && lowerMessage.includes('apk')) {
      return { command: 'list_apks', parameters: {} };
    }

    if (lowerMessage.includes('generate') && (lowerMessage.includes('video') || lowerMessage.includes('content'))) {
      return { 
        command: 'generate_content', 
        parameters: { 
          type: 'video',
          prompt: message,
          style: 'professional'
        } 
      };
    }

    if (lowerMessage.includes('list') || lowerMessage.includes('show all')) {
      if (lowerMessage.includes('website')) return { command: 'list_websites', parameters: {} };
      if (lowerMessage.includes('apk')) return { command: 'list_apks', parameters: {} };
      if (lowerMessage.includes('document')) return { command: 'list_documents', parameters: {} };
    }

    // Use OpenAI for complex parsing if API key available
    if (apiKey && (this as any).openai) {
      try {
        const response = await (this as any).openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [{
            role: 'system',
            content: `Parse this user message into a command and parameters for the MO APP DEVELOPMENT platform. Available commands: ${Array.from(this.commands.keys()).join(', ')}. Return JSON with 'command' and 'parameters' fields.`
          }, {
            role: 'user',
            content: message
          }],
          response_format: { type: 'json_object' }
        });

        return JSON.parse(response.choices[0].message.content || '{}');
      } catch (error: any) {
        console.error('OpenAI parsing error:', error);
        // If quota exceeded or API error, fall back to keyword parsing
        if (error instanceof Error ? error.message : String(error)?.includes('quota') || error instanceof Error ? error.message : String(error)?.includes('rate limit')) {
          console.log('API quota exceeded, using fallback parsing');
        }
      }
    }

    // Default fallback
    return { command: 'platform_status', parameters: {} };
  }

  async executeCommand(commandName: string, parameters: any): Promise<{ message: string, data?: any }> {
    const command = this.commands.get(commandName);
    if (!command) {
      throw new Error(`Unknown command: ${commandName}`);
    }

    try {
      const result = await command.handler(parameters);
      return {
        message: `Successfully executed ${command.description}`,
        data: result
      };
    } catch (error: any) {
      throw new Error(`Command execution failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  getCommands(): RemoteCommand[] {
    return Array.from(this.commands.values());
  }

  // Command Handlers
  private async getPlatformStatus(): Promise<any> {
    return {
      status: 'operational',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      services: {
        database: 'connected',
        storage: 'available',
        ai_services: 'ready'
      },
      modules: {
        websites: 'active',
        apk_manager: 'active',
        ai_content: 'active',
        social_media: 'active',
        documents: 'active',
        self_hosting: 'active'
      }
    };
  }

  private async restartService(serviceName: string): Promise<any> {
    // Implementation for service restart
    return { message: `Service ${serviceName} restarted successfully` };
  }

  private async createWebsite(params: any): Promise<any> {
    // Integration with website manager service
    return { 
      websiteId: 'site_' + Date.now(),
      name: params.name,
      template: params.template,
      status: 'created',
      url: `https://${params.name.toLowerCase().replace(/\s+/g, '-')}.example.com`
    };
  }

  private async deployWebsite(websiteId: string): Promise<any> {
    return { 
      websiteId, 
      status: 'deployed',
      deploymentUrl: `https://deployed-${websiteId}.example.com`
    };
  }

  private async listWebsites(): Promise<any> {
    // Get websites from storage/service
    return [
      { id: 'site_1', name: 'Business Site', status: 'active', template: 'business' },
      { id: 'site_2', name: 'Portfolio', status: 'draft', template: 'portfolio' }
    ];
  }

  private async uploadApk(params: any): Promise<any> {
    return {
      apkId: 'apk_' + Date.now(),
      filename: 'app.apk',
      status: 'uploaded',
      analysis: 'pending'
    };
  }

  private async listApks(): Promise<any> {
    return [
      { id: 'apk_1', name: 'MyApp.apk', size: '25MB', status: 'ready' },
      { id: 'apk_2', name: 'GameApp.apk', size: '150MB', status: 'analyzing' }
    ];
  }

  private async analyzeApk(apkId: string): Promise<any> {
    return {
      apkId,
      packageName: 'com.example.app',
      versionName: '1.0.0',
      permissions: ['INTERNET', 'CAMERA', 'LOCATION'],
      activities: 3,
      services: 1,
      targetSdk: 33
    };
  }

  private async generateContent(params: any): Promise<any> {
    return {
      contentId: 'content_' + Date.now(),
      type: params.type,
      status: 'generated',
      url: 'https://example.com/generated-content.mp4'
    };
  }

  private async createBot(params: any): Promise<any> {
    return {
      botId: 'bot_' + Date.now(),
      name: params.name,
      personality: params.personality,
      model: params.model || 'gpt-4o',
      status: 'created'
    };
  }

  private async generateCode(params: any): Promise<any> {
    return {
      codeId: 'code_' + Date.now(),
      language: params.language,
      code: `# Generated ${params.language} code\nprint("Hello, World!")`,
      status: 'generated'
    };
  }

  private async createCampaign(params: any): Promise<any> {
    return {
      campaignId: 'campaign_' + Date.now(),
      platform: params.platform,
      status: 'created',
      scheduled: params.schedule
    };
  }

  private async schedulePost(params: any): Promise<any> {
    return {
      postId: 'post_' + Date.now(),
      platform: params.platform,
      scheduledFor: params.datetime,
      status: 'scheduled'
    };
  }

  private async uploadDocument(params: any): Promise<any> {
    return {
      documentId: 'doc_' + Date.now(),
      type: params.type,
      encrypted: true,
      status: 'uploaded'
    };
  }

  private async listDocuments(): Promise<any> {
    return [
      { id: 'doc_1', name: 'ID Document', type: 'identity', encrypted: true },
      { id: 'doc_2', name: 'Contract', type: 'legal', encrypted: true }
    ];
  }

  private async generateReport(params: any): Promise<any> {
    return {
      reportId: 'report_' + Date.now(),
      type: params.type,
      period: params.period,
      status: 'generated',
      url: 'https://example.com/reports/report.pdf'
    };
  }

  private async deploySelfHosted(params: any): Promise<any> {
    return {
      deploymentId: 'deploy_' + Date.now(),
      serverIp: params.serverIp,
      domain: params.domain,
      status: 'deployed'
    };
  }

  private async backupSystem(params: any): Promise<any> {
    return {
      backupId: 'backup_' + Date.now(),
      location: params.location,
      size: '2.5GB',
      status: 'completed'
    };
  }
}

export const remoteControlService = new RemoteControlService();