import { 
  users, codeSnippets, projects, aiConversations, automationTasks, socialProfiles, campaigns, documents, commandHistory, scheduledTasks, crossPlatformPosts, platformConnections,
  type User, type InsertUser, type CodeSnippet, type InsertCodeSnippet,
  type Project, type InsertProject, type AiConversation, type InsertAiConversation,
  type AutomationTask, type InsertAutomationTask, type SocialProfile, type InsertSocialProfile,
  type Campaign, type InsertCampaign, type Document, type InsertDocument,
  type CommandHistory, type InsertCommandHistory, type ScheduledTask, type InsertScheduledTask,
  type CrossPlatformPost, type InsertCrossPlatformPost, type PlatformConnection, type InsertPlatformConnection
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;

  // Code Snippets
  getCodeSnippets(): Promise<CodeSnippet[]>;
  getCodeSnippet(id: number): Promise<CodeSnippet | undefined>;
  createCodeSnippet(snippet: InsertCodeSnippet): Promise<CodeSnippet>;
  updateCodeSnippet(id: number, snippet: Partial<InsertCodeSnippet>): Promise<CodeSnippet | undefined>;
  deleteCodeSnippet(id: number): Promise<boolean>;

  // Projects
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  getProjectTemplates(): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;

  // AI Conversations
  getAiConversations(): Promise<AiConversation[]>;
  createAiConversation(conversation: InsertAiConversation): Promise<AiConversation>;

  // Automation Tasks
  getAutomationTasks(): Promise<AutomationTask[]>;
  getAutomationTask(id: number): Promise<AutomationTask | undefined>;
  createAutomationTask(task: InsertAutomationTask): Promise<AutomationTask>;
  updateAutomationTask(id: number, task: Partial<InsertAutomationTask>): Promise<AutomationTask | undefined>;

  // Social Profiles
  getSocialProfiles(): Promise<SocialProfile[]>;
  getSocialProfile(id: number): Promise<SocialProfile | undefined>;
  createSocialProfile(profile: InsertSocialProfile): Promise<SocialProfile>;
  updateSocialProfile(id: number, profile: Partial<InsertSocialProfile>): Promise<SocialProfile | undefined>;
  deleteSocialProfile(id: number): Promise<boolean>;

  // Campaigns
  getCampaigns(): Promise<Campaign[]>;
  getCampaign(id: number): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, campaign: Partial<InsertCampaign>): Promise<Campaign | undefined>;
  deleteCampaign(id: number): Promise<boolean>;

  // Cross Platform Posts
  getCrossPlatformPosts(): Promise<CrossPlatformPost[]>;
  getCrossPlatformPost(id: number): Promise<CrossPlatformPost | undefined>;
  createCrossPlatformPost(post: InsertCrossPlatformPost): Promise<CrossPlatformPost>;
  updateCrossPlatformPost(id: number, post: Partial<InsertCrossPlatformPost>): Promise<CrossPlatformPost | undefined>;
  deleteCrossPlatformPost(id: number): Promise<boolean>;

  // Platform Connections
  getPlatformConnections(): Promise<PlatformConnection[]>;
  getPlatformConnection(id: number): Promise<PlatformConnection | undefined>;
  createPlatformConnection(connection: InsertPlatformConnection): Promise<PlatformConnection>;
  updatePlatformConnection(id: number, connection: Partial<InsertPlatformConnection>): Promise<PlatformConnection | undefined>;
  deletePlatformConnection(id: number): Promise<boolean>;

  // Documents
  getDocuments(): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: number): Promise<boolean>;

  // Command History
  getCommandHistory(): Promise<CommandHistory[]>;
  createCommandHistory(command: InsertCommandHistory): Promise<CommandHistory>;

  // Scheduled Tasks
  getScheduledTasks(): Promise<ScheduledTask[]>;
  getScheduledTask(id: number): Promise<ScheduledTask | undefined>;
  createScheduledTask(task: InsertScheduledTask): Promise<ScheduledTask>;
  updateScheduledTask(id: number, task: Partial<InsertScheduledTask>): Promise<ScheduledTask | undefined>;
  deleteScheduledTask(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private codeSnippets: Map<number, CodeSnippet> = new Map();
  private projects: Map<number, Project> = new Map();
  private aiConversations: Map<number, AiConversation> = new Map();
  private automationTasks: Map<number, AutomationTask> = new Map();
  private socialProfiles: Map<number, SocialProfile> = new Map();
  private campaigns: Map<number, Campaign> = new Map();
  private documents: Map<number, Document> = new Map();
  private commandHistory: Map<number, CommandHistory> = new Map();
  private scheduledTasks: Map<number, ScheduledTask> = new Map();
  private crossPlatformPosts: Map<number, CrossPlatformPost> = new Map();
  private platformConnections: Map<number, PlatformConnection> = new Map();
  private currentUserId = 1;
  private currentCodeSnippetId = 1;
  private currentProjectId = 1;
  private currentAiConversationId = 1;
  private currentAutomationTaskId = 1;
  private currentSocialProfileId = 1;
  private currentCampaignId = 1;
  private currentDocumentId = 1;
  private currentCommandHistoryId = 1;
  private currentScheduledTaskId = 1;
  private currentCrossPlatformPostId = 1;
  private currentPlatformConnectionId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed Phase 2 modules
    const defaultTasks: InsertAutomationTask[] = [
      {
        name: "SEO Manager",
        description: "Platform-wise keyword strategy & post scheduler",
        type: "seo-manager",
        status: "idle",
        config: { platforms: ["google", "youtube", "instagram"], budgetRs: 0 }
      },
      {
        name: "Instagram/Facebook Manager",
        description: "Multi-profile posting, inbox sorting, insights",
        type: "social-media",
        status: "active",
        config: { platforms: ["instagram", "facebook"], multiProfile: true }
      },
      {
        name: "YouTube/Threads/Telegram Manager",
        description: "Shorts, engagement plans, automation",
        type: "social-media",
        status: "idle",
        config: { platforms: ["youtube", "threads", "telegram"], contentType: "shorts" }
      },
      {
        name: "WhatsApp Marketing Bot",
        description: "Smart message flow, filters, responder",
        type: "whatsapp-marketing",
        status: "active",
        config: { autoResponder: true, messageFilters: true, flowAutomation: true }
      },
      {
        name: "Email Marketing Engine",
        description: "Campaign creator, segmentation, analytics",
        type: "email-marketing",
        status: "idle",
        config: { segmentation: true, analytics: true, automation: true }
      },
      {
        name: "Data Acquisition Tool",
        description: "Collect emails, numbers ethically via APIs/forms",
        type: "data-acquisition",
        status: "idle",
        config: { sources: ["apis", "forms"], ethical: true, gdprCompliant: true }
      },
      {
        name: "Ad Budget Auto-Planner",
        description: "₹0 default, optional upgrade logic",
        type: "ad-budget",
        status: "active",
        config: { defaultBudget: 0, upgradeLogic: true, roasOptimization: true }
      },
      {
        name: "Profile Strategy Split",
        description: "Service/Product = ROAS, Creator = Engagement",
        type: "profile-strategy",
        status: "active",
        config: { serviceRoas: true, creatorEngagement: true, autoDetect: true }
      },
      {
        name: "Government Form Automation",
        description: "Passport, GST, PAN via secure scripts",
        type: "government-forms",
        status: "idle",
        config: { forms: ["passport", "gst", "pan"], secureScripts: true }
      },
      {
        name: "Task Scheduler + Execution",
        description: "Schedule based command automation",
        type: "task-scheduler",
        status: "active",
        config: { cronJobs: true, commandExecution: true, errorHandling: true }
      }
    ];

    defaultTasks.forEach(task => this.createAutomationTask(task));

    // Seed social profiles
    const defaultProfiles: InsertSocialProfile[] = [
      {
        platform: "instagram",
        username: "demo_business",
        profileType: "service",
        strategy: "roas",
        isActive: true
      },
      {
        platform: "youtube",
        username: "demo_creator",
        profileType: "creator",
        strategy: "engagement",
        isActive: true
      }
    ];

    defaultProfiles.forEach(profile => this.createSocialProfile(profile));

    // Seed project templates
    const defaultTemplates: InsertProject[] = [
      {
        name: "Phone Automation Bot",
        description: "Complete automation framework for Android devices",
        template: "phone-automation",
        language: "python",
        code: `#!/usr/bin/env python3
"""
AI-Generated Phone Automation Framework
Secure automation for Android devices via Termux
"""

import os
import json
import subprocess
from pathlib import Path

class PhoneAutomationBot:
    def __init__(self):
        self.config = self.load_config()
        self.setup_security()
    
    def load_config(self):
        """Load encrypted configuration"""
        config_path = Path.home() / '.automation' / 'config.json'
        if config_path.exists():
            with open(config_path, 'r') as f:
                return json.load(f)
        return {}
    
    def setup_security(self):
        """Initialize security protocols"""
        # Implement end-to-end encryption
        pass
    
    def organize_messages(self):
        """Smart message organization and auto-reply"""
        # Implement message automation
        pass
    
    def cleanup_gallery(self):
        """AI-powered photo organization"""
        # Implement gallery cleanup
        pass
    
    def manage_files(self):
        """Intelligent file organization"""
        # Implement file management
        pass

if __name__ == "__main__":
    bot = PhoneAutomationBot()
    print("Phone Automation Bot initialized securely")`,
        files: {
          "main.py": "# Main automation script",
          "config.json": "# Configuration file",
          "security.py": "# Security utilities"
        },
        isTemplate: true
      },
      {
        name: "Browser Automation",
        description: "Social media management and web automation",
        template: "browser-automation",
        language: "javascript",
        code: `/**
 * AI-Generated Browser Automation Framework
 * Secure social media management for mobile devices
 */

class BrowserAutomationBot {
    constructor() {
        this.config = this.loadConfig();
        this.setupSecurity();
    }

    loadConfig() {
        // Load encrypted configuration
        return {};
    }

    setupSecurity() {
        // Initialize privacy protection
        console.log("Privacy mode activated");
    }

    async automateInstagram() {
        // Smart Instagram management
        console.log("Instagram automation started");
    }

    async automateFacebook() {
        // Intelligent Facebook management
        console.log("Facebook automation started");
    }

    async scheduleContent() {
        // AI-powered content scheduling
        console.log("Content scheduling activated");
    }
}

// Initialize bot securely
const bot = new BrowserAutomationBot();`,
        files: {
          "main.js": "# Main browser automation",
          "instagram.js": "# Instagram automation",
          "facebook.js": "# Facebook automation"
        },
        isTemplate: true
      },
      {
        name: "File Manager Pro",
        description: "Smart file organization with AI classification",
        template: "file-manager",
        language: "python",
        code: `#!/usr/bin/env python3
"""
AI-Powered File Manager for Mobile Devices
Smart organization and cleanup utilities
"""

import os
import shutil
from pathlib import Path
import mimetypes

class FileManagerPro:
    def __init__(self):
        self.downloads_path = Path.home() / 'storage' / 'downloads'
        self.organized_path = Path.home() / 'storage' / 'organized'
        self.setup_directories()
    
    def setup_directories(self):
        """Create organized directory structure"""
        categories = ['documents', 'images', 'videos', 'audio', 'apps', 'archives']
        for category in categories:
            (self.organized_path / category).mkdir(parents=True, exist_ok=True)
    
    def classify_file(self, file_path):
        """AI-powered file classification"""
        mime_type, _ = mimetypes.guess_type(file_path)
        if not mime_type:
            return 'documents'
        
        if mime_type.startswith('image'):
            return 'images'
        elif mime_type.startswith('video'):
            return 'videos'
        elif mime_type.startswith('audio'):
            return 'audio'
        elif mime_type.startswith('application'):
            if 'zip' in mime_type or 'rar' in mime_type:
                return 'archives'
            elif 'android' in mime_type:
                return 'apps'
        
        return 'documents'
    
    def organize_downloads(self):
        """Smart file organization"""
        if not self.downloads_path.exists():
            return
        
        for file_path in self.downloads_path.iterdir():
            if file_path.is_file():
                category = self.classify_file(file_path)
                dest_path = self.organized_path / category / file_path.name
                
                try:
                    shutil.move(str(file_path), str(dest_path))
                    print(f"Moved {file_path.name} to {category}")
                except Exception as e:
                    print(f"Error moving {file_path.name}: {e}")

if __name__ == "__main__":
    manager = FileManagerPro()
    manager.organize_downloads()`,
        files: {
          "file_manager.py": "# Main file management",
          "classifier.py": "# AI file classification",
          "utils.py": "# Utility functions"
        },
        isTemplate: true
      },
      {
        name: "Privacy Guardian",
        description: "Security and privacy protection toolkit",
        template: "privacy-guardian",
        language: "shell",
        code: `#!/bin/bash
# AI-Generated Privacy Guardian
# Comprehensive security toolkit for mobile devices

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "\\$\\{BASH_SOURCE[0]\\}")" && pwd)"
LOG_FILE="$HOME/.privacy_guardian.log"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

setup_privacy_protection() {
    log "Setting up privacy protection..."
    
    # Clear browser data
    clear_browser_data
    
    # Secure file permissions
    secure_file_permissions
    
    # Network security
    setup_network_security
    
    log "Privacy protection setup complete"
}

clear_browser_data() {
    log "Clearing browser data..."
    # Clear cache, cookies, history
    find "$HOME" -name "*.cache" -type d -exec rm -rf {} + 2>/dev/null || true
}

secure_file_permissions() {
    log "Securing file permissions..."
    # Set secure permissions on sensitive directories
    chmod 700 "$HOME/.ssh" 2>/dev/null || true
    chmod 600 "$HOME/.ssh/*" 2>/dev/null || true
}

setup_network_security() {
    log "Configuring network security..."
    # Configure secure network settings
    echo "Network security configured"
}

encrypt_sensitive_data() {
    log "Encrypting sensitive data..."
    # Implement encryption for API keys and personal data
    echo "Data encryption activated"
}

monitor_privacy() {
    log "Starting privacy monitoring..."
    # Monitor for privacy breaches
    echo "Privacy monitoring active"
}

main() {
    log "Privacy Guardian starting..."
    setup_privacy_protection
    encrypt_sensitive_data
    monitor_privacy
    log "Privacy Guardian active and protecting your data"
}

if [[ "\\$\\{BASH_SOURCE[0]\\}" == "\\$\\{0\\}" ]]; then
    main "$@"
fi`,
        files: {
          "privacy_guardian.sh": "# Main privacy script",
          "encryption.sh": "# Data encryption utilities",
          "monitoring.sh": "# Privacy monitoring"
        },
        isTemplate: true
      }
    ];

    defaultTemplates.forEach(template => this.createProject(template));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || 'user',
      createdAt: new Date(),
      lastLogin: null,
      email: insertUser.email || null,
      isActive: insertUser.isActive ?? true
    };
    this.users.set(id, user);
    return user;
  }

  // Code Snippet methods
  async getCodeSnippets(): Promise<CodeSnippet[]> {
    return Array.from(this.codeSnippets.values());
  }

  async getCodeSnippet(id: number): Promise<CodeSnippet | undefined> {
    return this.codeSnippets.get(id);
  }

  async createCodeSnippet(snippet: InsertCodeSnippet): Promise<CodeSnippet> {
    const id = this.currentCodeSnippetId++;
    const codeSnippet: CodeSnippet = { 
      ...snippet, 
      id, 
      createdAt: new Date(),
      description: snippet.description || null,
      tags: snippet.tags || null
    };
    this.codeSnippets.set(id, codeSnippet);
    return codeSnippet;
  }

  async updateCodeSnippet(id: number, snippet: Partial<InsertCodeSnippet>): Promise<CodeSnippet | undefined> {
    const existing = this.codeSnippets.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...snippet };
    this.codeSnippets.set(id, updated);
    return updated;
  }

  async deleteCodeSnippet(id: number): Promise<boolean> {
    return this.codeSnippets.delete(id);
  }

  // Project methods
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjectTemplates(): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(p => p.isTemplate);
  }

  async createProject(project: InsertProject): Promise<Project> {
    const id = this.currentProjectId++;
    const newProject: Project = { 
      ...project, 
      id, 
      createdAt: new Date(),
      description: project.description || null,
      files: project.files || {},
      isTemplate: project.isTemplate || null
    };
    this.projects.set(id, newProject);
    return newProject;
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    const existing = this.projects.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...project };
    this.projects.set(id, updated);
    return updated;
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }

  // AI Conversation methods
  async getAiConversations(): Promise<AiConversation[]> {
    return Array.from(this.aiConversations.values());
  }

  async createAiConversation(conversation: InsertAiConversation): Promise<AiConversation> {
    const id = this.currentAiConversationId++;
    const aiConversation: AiConversation = { 
      ...conversation, 
      id, 
      createdAt: new Date() 
    };
    this.aiConversations.set(id, aiConversation);
    return aiConversation;
  }

  // Automation Task methods
  async getAutomationTasks(): Promise<AutomationTask[]> {
    return Array.from(this.automationTasks.values());
  }

  async getAutomationTask(id: number): Promise<AutomationTask | undefined> {
    return this.automationTasks.get(id);
  }

  async createAutomationTask(task: InsertAutomationTask): Promise<AutomationTask> {
    const id = this.currentAutomationTaskId++;
    const automationTask: AutomationTask = { 
      ...task, 
      id, 
      createdAt: new Date(),
      lastRun: null,
      description: task.description || null,
      status: task.status || 'idle',
      config: task.config || {}
    };
    this.automationTasks.set(id, automationTask);
    return automationTask;
  }

  async updateAutomationTask(id: number, task: Partial<InsertAutomationTask>): Promise<AutomationTask | undefined> {
    const existing = this.automationTasks.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...task };
    this.automationTasks.set(id, updated);
    return updated;
  }

  // Social Profile methods
  async getSocialProfiles(): Promise<SocialProfile[]> {
    return Array.from(this.socialProfiles.values());
  }

  async getSocialProfile(id: number): Promise<SocialProfile | undefined> {
    return this.socialProfiles.get(id);
  }

  async createSocialProfile(profile: InsertSocialProfile): Promise<SocialProfile> {
    const id = this.currentSocialProfileId++;
    const socialProfile: SocialProfile = { 
      ...profile, 
      id, 
      createdAt: new Date(),
      isActive: profile.isActive ?? true,
      accessToken: profile.accessToken || null
    };
    this.socialProfiles.set(id, socialProfile);
    return socialProfile;
  }

  async updateSocialProfile(id: number, profile: Partial<InsertSocialProfile>): Promise<SocialProfile | undefined> {
    const existing = this.socialProfiles.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...profile };
    this.socialProfiles.set(id, updated);
    return updated;
  }

  async deleteSocialProfile(id: number): Promise<boolean> {
    return this.socialProfiles.delete(id);
  }

  // Campaign methods
  async getCampaigns(): Promise<Campaign[]> {
    return Array.from(this.campaigns.values());
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const id = this.currentCampaignId++;
    const newCampaign: Campaign = { 
      ...campaign, 
      id, 
      createdAt: new Date(),
      status: campaign.status || 'draft',
      profileId: campaign.profileId || null,
      budget: campaign.budget || null,
      content: campaign.content || {},
      schedule: campaign.schedule || {},
      metrics: campaign.metrics || {}
    };
    this.campaigns.set(id, newCampaign);
    return newCampaign;
  }

  async updateCampaign(id: number, campaign: Partial<InsertCampaign>): Promise<Campaign | undefined> {
    const existing = this.campaigns.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...campaign };
    this.campaigns.set(id, updated);
    return updated;
  }

  async deleteCampaign(id: number): Promise<boolean> {
    return this.campaigns.delete(id);
  }

  // Document methods
  async getDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const id = this.currentDocumentId++;
    const newDocument: Document = { 
      ...document, 
      id, 
      uploadedAt: new Date(),
      expiryDate: document.expiryDate || null
    };
    this.documents.set(id, newDocument);
    return newDocument;
  }

  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }

  // Command History methods
  async getCommandHistory(): Promise<CommandHistory[]> {
    return Array.from(this.commandHistory.values());
  }

  async createCommandHistory(command: InsertCommandHistory): Promise<CommandHistory> {
    const id = this.currentCommandHistoryId++;
    const commandEntry: CommandHistory = { 
      ...command, 
      id, 
      executedAt: new Date(),
      output: command.output || null
    };
    this.commandHistory.set(id, commandEntry);
    return commandEntry;
  }

  // Scheduled Task methods
  async getScheduledTasks(): Promise<ScheduledTask[]> {
    return Array.from(this.scheduledTasks.values());
  }

  async getScheduledTask(id: number): Promise<ScheduledTask | undefined> {
    return this.scheduledTasks.get(id);
  }

  async createScheduledTask(task: InsertScheduledTask): Promise<ScheduledTask> {
    const id = this.currentScheduledTaskId++;
    const scheduledTask: ScheduledTask = { 
      id, 
      name: task.name,
      type: task.type || "command",
      command: task.command || null,
      cronExpression: task.cronExpression,
      status: task.status || "active",
      createdAt: new Date(),
      lastRun: null,
      nextRun: null
    };
    this.scheduledTasks.set(id, scheduledTask);
    return scheduledTask;
  }

  async updateScheduledTask(id: number, task: Partial<InsertScheduledTask>): Promise<ScheduledTask | undefined> {
    const existing = this.scheduledTasks.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...task };
    this.scheduledTasks.set(id, updated);
    return updated;
  }

  async deleteScheduledTask(id: number): Promise<boolean> {
    return this.scheduledTasks.delete(id);
  }

  // Cross Platform Posts methods
  async getCrossPlatformPosts(): Promise<CrossPlatformPost[]> {
    return Array.from(this.crossPlatformPosts.values());
  }

  async getCrossPlatformPost(id: number): Promise<CrossPlatformPost | undefined> {
    return this.crossPlatformPosts.get(id);
  }

  async createCrossPlatformPost(post: InsertCrossPlatformPost): Promise<CrossPlatformPost> {
    const id = this.currentCrossPlatformPostId++;
    const newPost: CrossPlatformPost = {
      ...post,
      id,
      createdAt: new Date(),
      mediaUrls: post.mediaUrls || null,
      targetPlatforms: post.targetPlatforms || null,
      scheduledTime: post.scheduledTime || null,
      postingStatus: post.postingStatus || 'draft',
      platformFormats: post.platformFormats || {},
      postResults: post.postResults || {},
      autoFormatEnabled: post.autoFormatEnabled ?? true,
      hashtagStrategy: post.hashtagStrategy || 'trending',
      engagementBoost: post.engagementBoost ?? false
    };
    this.crossPlatformPosts.set(id, newPost);
    return newPost;
  }

  async updateCrossPlatformPost(id: number, post: Partial<InsertCrossPlatformPost>): Promise<CrossPlatformPost | undefined> {
    const existing = this.crossPlatformPosts.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...post };
    this.crossPlatformPosts.set(id, updated);
    return updated;
  }

  async deleteCrossPlatformPost(id: number): Promise<boolean> {
    return this.crossPlatformPosts.delete(id);
  }

  // Platform Connections methods
  async getPlatformConnections(): Promise<PlatformConnection[]> {
    return Array.from(this.platformConnections.values());
  }

  async getPlatformConnection(id: number): Promise<PlatformConnection | undefined> {
    return this.platformConnections.get(id);
  }

  async createPlatformConnection(connection: InsertPlatformConnection): Promise<PlatformConnection> {
    const id = this.currentPlatformConnectionId++;
    const newConnection: PlatformConnection = {
      ...connection,
      id,
      isActive: connection.isActive ?? true,
      createdAt: new Date(),
      lastSync: null,
      credentials: connection.credentials || {},
      rateLimits: connection.rateLimits || {},
      postingCapabilities: connection.postingCapabilities || {}
    };
    this.platformConnections.set(id, newConnection);
    return newConnection;
  }

  async updatePlatformConnection(id: number, connection: Partial<InsertPlatformConnection>): Promise<PlatformConnection | undefined> {
    const existing = this.platformConnections.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...connection };
    this.platformConnections.set(id, updated);
    return updated;
  }

  async deletePlatformConnection(id: number): Promise<boolean> {
    return this.platformConnections.delete(id);
  }

  // Update User method 
  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const existing = this.users.get(id);
    if (!existing) throw new Error('User not found');
    
    const updated = { ...existing, ...updates };
    this.users.set(id, updated);
    return updated;
  }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  // Code Snippet methods
  async getCodeSnippets(): Promise<CodeSnippet[]> {
    return await db.select().from(codeSnippets);
  }

  async getCodeSnippet(id: number): Promise<CodeSnippet | undefined> {
    const [snippet] = await db.select().from(codeSnippets).where(eq(codeSnippets.id, id));
    return snippet || undefined;
  }

  async createCodeSnippet(snippet: InsertCodeSnippet): Promise<CodeSnippet> {
    const [newSnippet] = await db.insert(codeSnippets).values(snippet).returning();
    return newSnippet;
  }

  async updateCodeSnippet(id: number, snippet: Partial<InsertCodeSnippet>): Promise<CodeSnippet | undefined> {
    const [updated] = await db.update(codeSnippets).set(snippet).where(eq(codeSnippets.id, id)).returning();
    return updated || undefined;
  }

  async deleteCodeSnippet(id: number): Promise<boolean> {
    const result = await db.delete(codeSnippets).where(eq(codeSnippets.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Project methods
  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects);
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async getProjectTemplates(): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.isTemplate, true));
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    const [updated] = await db.update(projects).set(project).where(eq(projects.id, id)).returning();
    return updated || undefined;
  }

  async deleteProject(id: number): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return (result.rowCount || 0) > 0;
  }

  // AI Conversation methods
  async getAiConversations(): Promise<AiConversation[]> {
    return await db.select().from(aiConversations);
  }

  async createAiConversation(conversation: InsertAiConversation): Promise<AiConversation> {
    const [newConversation] = await db.insert(aiConversations).values(conversation).returning();
    return newConversation;
  }

  // Automation Task methods
  async getAutomationTasks(): Promise<AutomationTask[]> {
    return await db.select().from(automationTasks);
  }

  async getAutomationTask(id: number): Promise<AutomationTask | undefined> {
    const [task] = await db.select().from(automationTasks).where(eq(automationTasks.id, id));
    return task || undefined;
  }

  async createAutomationTask(task: InsertAutomationTask): Promise<AutomationTask> {
    const [newTask] = await db.insert(automationTasks).values(task).returning();
    return newTask;
  }

  async updateAutomationTask(id: number, task: Partial<InsertAutomationTask>): Promise<AutomationTask | undefined> {
    const [updated] = await db.update(automationTasks).set(task).where(eq(automationTasks.id, id)).returning();
    return updated || undefined;
  }

  // Social Profile methods
  async getSocialProfiles(): Promise<SocialProfile[]> {
    return await db.select().from(socialProfiles);
  }

  async getSocialProfile(id: number): Promise<SocialProfile | undefined> {
    const [profile] = await db.select().from(socialProfiles).where(eq(socialProfiles.id, id));
    return profile || undefined;
  }

  async createSocialProfile(profile: InsertSocialProfile): Promise<SocialProfile> {
    const [newProfile] = await db.insert(socialProfiles).values(profile).returning();
    return newProfile;
  }

  async updateSocialProfile(id: number, profile: Partial<InsertSocialProfile>): Promise<SocialProfile | undefined> {
    const [updated] = await db.update(socialProfiles).set(profile).where(eq(socialProfiles.id, id)).returning();
    return updated || undefined;
  }

  async deleteSocialProfile(id: number): Promise<boolean> {
    const result = await db.delete(socialProfiles).where(eq(socialProfiles.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Campaign methods
  async getCampaigns(): Promise<Campaign[]> {
    return await db.select().from(campaigns);
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign || undefined;
  }

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const [newCampaign] = await db.insert(campaigns).values(campaign).returning();
    return newCampaign;
  }

  async updateCampaign(id: number, campaign: Partial<InsertCampaign>): Promise<Campaign | undefined> {
    const [updated] = await db.update(campaigns).set(campaign).where(eq(campaigns.id, id)).returning();
    return updated || undefined;
  }

  async deleteCampaign(id: number): Promise<boolean> {
    const result = await db.delete(campaigns).where(eq(campaigns.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Cross Platform Posts methods
  async getCrossPlatformPosts(): Promise<CrossPlatformPost[]> {
    return await db.select().from(crossPlatformPosts).orderBy(crossPlatformPosts.createdAt);
  }

  async getCrossPlatformPost(id: number): Promise<CrossPlatformPost | undefined> {
    const [post] = await db.select().from(crossPlatformPosts).where(eq(crossPlatformPosts.id, id));
    return post || undefined;
  }

  async createCrossPlatformPost(post: InsertCrossPlatformPost): Promise<CrossPlatformPost> {
    const [newPost] = await db.insert(crossPlatformPosts).values(post).returning();
    return newPost;
  }

  async updateCrossPlatformPost(id: number, post: Partial<InsertCrossPlatformPost>): Promise<CrossPlatformPost | undefined> {
    const [updated] = await db.update(crossPlatformPosts).set(post).where(eq(crossPlatformPosts.id, id)).returning();
    return updated || undefined;
  }

  async deleteCrossPlatformPost(id: number): Promise<boolean> {
    const result = await db.delete(crossPlatformPosts).where(eq(crossPlatformPosts.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Platform Connections methods
  async getPlatformConnections(): Promise<PlatformConnection[]> {
    return await db.select().from(platformConnections).orderBy(platformConnections.createdAt);
  }

  async getPlatformConnection(id: number): Promise<PlatformConnection | undefined> {
    const [connection] = await db.select().from(platformConnections).where(eq(platformConnections.id, id));
    return connection || undefined;
  }

  async createPlatformConnection(connection: InsertPlatformConnection): Promise<PlatformConnection> {
    const [newConnection] = await db.insert(platformConnections).values(connection).returning();
    return newConnection;
  }

  async updatePlatformConnection(id: number, connection: Partial<InsertPlatformConnection>): Promise<PlatformConnection | undefined> {
    const [updated] = await db.update(platformConnections).set(connection).where(eq(platformConnections.id, id)).returning();
    return updated || undefined;
  }

  async deletePlatformConnection(id: number): Promise<boolean> {
    const result = await db.delete(platformConnections).where(eq(platformConnections.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Document methods
  async getDocuments(): Promise<Document[]> {
    return await db.select().from(documents);
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document || undefined;
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db.insert(documents).values(document).returning();
    return newDocument;
  }

  async deleteDocument(id: number): Promise<boolean> {
    const result = await db.delete(documents).where(eq(documents.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Command History methods
  async getCommandHistory(): Promise<CommandHistory[]> {
    return await db.select().from(commandHistory);
  }

  async createCommandHistory(command: InsertCommandHistory): Promise<CommandHistory> {
    const [newCommand] = await db.insert(commandHistory).values(command).returning();
    return newCommand;
  }

  // Scheduled Task methods
  async getScheduledTasks(): Promise<ScheduledTask[]> {
    return await db.select().from(scheduledTasks);
  }

  async getScheduledTask(id: number): Promise<ScheduledTask | undefined> {
    const [task] = await db.select().from(scheduledTasks).where(eq(scheduledTasks.id, id));
    return task || undefined;
  }

  async createScheduledTask(task: InsertScheduledTask): Promise<ScheduledTask> {
    const [newTask] = await db.insert(scheduledTasks).values(task).returning();
    return newTask;
  }

  async updateScheduledTask(id: number, task: Partial<InsertScheduledTask>): Promise<ScheduledTask | undefined> {
    const [updated] = await db.update(scheduledTasks).set(task).where(eq(scheduledTasks.id, id)).returning();
    return updated || undefined;
  }

  async deleteScheduledTask(id: number): Promise<boolean> {
    const result = await db.delete(scheduledTasks).where(eq(scheduledTasks.id, id));
    return (result.rowCount || 0) > 0;
  }
}

export const storage = new DatabaseStorage();
