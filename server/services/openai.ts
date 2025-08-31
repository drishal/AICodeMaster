import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

// API Key rotation system for handling quota limits
const API_KEYS = (process.env.OPENAI_API_KEYS || process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "").split(',').filter(key => key.trim());
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

export interface CodeGenerationRequest {
  prompt: string;
  language: string;
  mode: string;
}

export interface CodeGenerationResponse {
  code: string;
  explanation: string;
  suggestions: string[];
}

export async function generateCode(request: CodeGenerationRequest): Promise<CodeGenerationResponse> {
  let lastError: Error | null = null;
  
  // Try each API key if quota exceeded
  for (let attempt = 0; attempt < API_KEYS.length; attempt++) {
    try {
      const openai = createOpenAIClient();
      
      const systemPrompt = `You are an AI coding assistant specialized in mobile development and automation for Termux/Android environments. 
      
      Generate secure, production-ready code with the following requirements:
      - Focus on privacy and security
      - Mobile-optimized and Termux-compatible
      - Include error handling and logging
      - Follow best practices for the specified language
      - Provide clear explanations and comments
      
      Mode: ${request.mode}
      Language: ${request.language}
      
      Respond with JSON in this format:
      {
        "code": "generated code here",
        "explanation": "explanation of the code",
        "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
      }`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: request.prompt }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        code: result.code || '',
        explanation: result.explanation || '',
        suggestions: result.suggestions || []
      };
    } catch (error: any) {
      lastError = error;
      console.error(`OpenAI API error (attempt ${attempt + 1}):`, error);
      
      // If quota exceeded, try next key
      if (error.status === 429 && error.code === 'insufficient_quota' && attempt < API_KEYS.length - 1) {
        console.log(`Quota exceeded on key ${attempt + 1}, trying next key...`);
        continue;
      }
      // For other errors, break immediately
      break;
    }
  }
  
  throw new Error('Failed to generate code: ' + (lastError?.message || 'All API keys exhausted'));
}

export async function explainCode(code: string, language: string): Promise<string> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < API_KEYS.length; attempt++) {
    try {
      const openai = createOpenAIClient();
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a code explanation expert. Provide clear, detailed explanations of code functionality, breaking down complex parts into understandable segments."
          },
          {
            role: "user",
            content: `Explain this ${language} code:\n\n${code}`
          }
        ],
        max_tokens: 1000,
      });

      return response.choices[0].message.content || 'Unable to explain code.';
    } catch (error: any) {
      lastError = error;
      console.error(`OpenAI API error (attempt ${attempt + 1}):`, error);
      
      if (error.status === 429 && error.code === 'insufficient_quota' && attempt < API_KEYS.length - 1) {
        console.log(`Quota exceeded on key ${attempt + 1}, trying next key...`);
        continue;
      }
      break;
    }
  }
  
  throw new Error('Failed to explain code: ' + (lastError?.message || 'All API keys exhausted'));
}

export async function generateTermuxCommands(description: string): Promise<string[]> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < API_KEYS.length; attempt++) {
    try {
      const openai = createOpenAIClient();
      
      const systemPrompt = `You are a Termux command expert. Generate safe, practical Termux/Linux commands for mobile Android environments.
      
      Respond with JSON in this format:
      {
        "commands": ["command1", "command2", "command3"]
      }`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate Termux commands for: ${description}` }
        ],
        response_format: { type: "json_object" },
        max_tokens: 500,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result.commands || [];
    } catch (error: any) {
      lastError = error;
      console.error(`OpenAI API error (attempt ${attempt + 1}):`, error);
      
      if (error.status === 429 && error.code === 'insufficient_quota' && attempt < API_KEYS.length - 1) {
        console.log(`Quota exceeded on key ${attempt + 1}, trying next key...`);
        continue;
      }
      break;
    }
  }
  
  throw new Error('Failed to generate commands: ' + (lastError?.message || 'All API keys exhausted'));
}

export async function generateAutomationScript(task: string, platform: string): Promise<string> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < API_KEYS.length; attempt++) {
    try {
      const openai = createOpenAIClient();
      
      const systemPrompt = `You are an automation expert specializing in secure mobile automation scripts. 
      Generate privacy-focused automation code that protects user data and follows security best practices.
      
      Platform: ${platform}
      Focus on: Security, Privacy, Error Handling, Mobile Optimization`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Create an automation script for: ${task}` }
        ],
        max_tokens: 1500,
      });

      return response.choices[0].message.content || '';
    } catch (error: any) {
      lastError = error;
      console.error(`OpenAI API error (attempt ${attempt + 1}):`, error);
      
      if (error.status === 429 && error.code === 'insufficient_quota' && attempt < API_KEYS.length - 1) {
        console.log(`Quota exceeded on key ${attempt + 1}, trying next key...`);
        continue;
      }
      break;
    }
  }
  
  throw new Error('Failed to generate automation script: ' + (lastError?.message || 'All API keys exhausted'));
}
