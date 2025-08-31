import type { Express } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import { storage } from "./storage";
import { 
  insertCodeSnippetSchema, 
  insertProjectSchema, 
  insertAiConversationSchema, 
  insertAutomationTaskSchema,
  insertSocialProfileSchema,
  insertCampaignSchema,
  insertDocumentSchema,
  insertCommandHistorySchema,
  insertScheduledTaskSchema,
  insertContactSchema,
  insertContactActivitySchema
} from "@shared/schema";
import { 
  generateCode, 
  explainCode, 
  generateTermuxCommands, 
  generateAutomationScript 
} from "./services/openai";
import { OfflineDevService } from "./services/offline-dev-service";
import { websiteManagerService } from "./services/website-manager-service";
import { apkManagerService } from "./services/apk-manager-service";
import { remoteControlService } from "./services/remote-control-service";
import { leadCRMService } from "./services/lead-crm-service";
import { automationMarketingEngine } from "./services/automation-marketing-engine";
import { reelEditorService } from "./services/reel-editor-service";
import { analyticsService } from "./services/analytics-service";
import { performanceOptimizer } from "./services/performance-optimizer";
import { contentStrategyService } from "./services/content-strategy-service";
import { seoOptimizerService } from "./services/seo-optimizer-service";
import { gifEditorService } from "./services/gif-editor-service";
import { clipSortService } from "./services/clip-sort-service";
import { mobileControlService } from "./services/mobile-control-service";
import { calendarGeneratorService } from "./services/calendar-generator-service";
import { trendsScraperService } from "./services/trends-scraper-service";
import { competitorBenchmarkingService } from "./services/competitor-benchmarking-service";
import { autoBlogWriterService } from "./services/auto-blog-writer-service";
import { googleDriveService } from "./services/google-drive-service";
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const offlineDevService = new OfflineDevService();

// Configure multer for APK uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.originalname.toLowerCase().endsWith('.apk')) {
      cb(null, true);
    } else {
      cb(new Error('Only APK files are allowed'));
    }
  }
});

// Authentication middleware - DISABLED (public access)
function requireAuth(req: any, res: any, next: any) {
  // Authentication disabled - allow all requests
  return next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Download routes (public - for APK package distribution)
  app.get("/api/download/apk-package", (req, res) => {
    try {
      const filePath = path.join(process.cwd(), 'downloads', 'mo-app-development-apk-package.tar.gz');
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ 
          message: 'APK package not found. Run the APK build script first.',
          instructions: 'Execute: chmod +x create-apk-package.sh && ./create-apk-package.sh'
        });
      }

      const stats = fs.statSync(filePath);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

      res.set({
        'Content-Type': 'application/gzip',
        'Content-Disposition': 'attachment; filename="mo-app-development-apk-package.tar.gz"',
        'Content-Length': stats.size,
        'X-Package-Size': `${fileSizeMB} MB`,
        'X-Package-Info': 'MO APP DEVELOPMENT - Complete APK Build Package'
      });

      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    } catch (error: any) {
      res.status(500).json({ message: 'Download failed', error: error.message });
    }
  });

  app.get("/api/download/info", (req, res) => {
    try {
      const infoPath = path.join(process.cwd(), 'downloads', 'DOWNLOAD_INFO.md');
      
      if (!fs.existsSync(infoPath)) {
        return res.status(404).json({ message: 'Download info not found' });
      }

      const content = fs.readFileSync(infoPath, 'utf-8');
      res.set('Content-Type', 'text/markdown');
      res.send(content);
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to load info', error: error.message });
    }
  });

  // Source code download route
  app.get("/api/download/source-code", (req, res) => {
    try {
      const filePath = path.join(process.cwd(), 'downloads', 'mo-app-development-source-code.tar.gz');
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'Source code package not found' });
      }

      const stats = fs.statSync(filePath);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(0);

      res.set({
        'Content-Type': 'application/gzip',
        'Content-Disposition': 'attachment; filename="mo-app-development-source-code.tar.gz"',
        'Content-Length': stats.size,
        'X-Package-Size': `${fileSizeMB} MB`,
        'X-Package-Info': 'MO APP DEVELOPMENT - Complete Source Code'
      });

      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    } catch (error: any) {
      res.status(500).json({ message: 'Download failed', error: error.message });
    }
  });

  // Installable APK download route
  app.get("/api/download/installable-apk", (req, res) => {
    try {
      const filePath = path.join(process.cwd(), 'mo-app-development-installable.tar.gz');
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ 
          message: 'Installable APK package not found',
          instructions: 'Run: ./create-installable-apk.sh to generate the package'
        });
      }

      const stats = fs.statSync(filePath);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

      res.set({
        'Content-Type': 'application/gzip',
        'Content-Disposition': 'attachment; filename="mo-app-development-installable.tar.gz"',
        'Content-Length': stats.size,
        'X-Package-Size': `${fileSizeMB} MB`,
        'X-Package-Info': 'MO APP DEVELOPMENT - Installable APK Package',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      });

      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    } catch (error: any) {
      res.status(500).json({ message: 'Download failed', error: error.message });
    }
  });

  // Debug APK download route
  app.get("/api/download/debug-apk", (req, res) => {
    try {
      const filePath = path.join(process.cwd(), 'mo-assistant-debug.apk.tar.gz');
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ 
          message: 'Debug APK package not found',
          instructions: 'Run: ./create-debug-apk.sh to generate the package'
        });
      }

      const stats = fs.statSync(filePath);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

      res.set({
        'Content-Type': 'application/gzip',
        'Content-Disposition': 'attachment; filename="mo-assistant-debug.apk.tar.gz"',
        'Content-Length': stats.size,
        'X-Package-Size': `${fileSizeMB} MB`,
        'X-Package-Info': 'MO APP DEVELOPMENT - Debug APK Package',
        'X-Build-Type': 'Debug APK for Android Development',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      });

      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    } catch (error: any) {
      res.status(500).json({ message: 'Download failed', error: error.message });
    }
  });

  // Final APK download route
  app.get("/api/download/final-apk", (req, res) => {
    try {
      const filePath = path.join(process.cwd(), 'mo-assistant-final.apk.tar.gz');
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ 
          message: 'Final APK package not found',
          instructions: 'Run: ./build-final-apk.sh to generate the package'
        });
      }

      const stats = fs.statSync(filePath);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

      res.set({
        'Content-Type': 'application/gzip',
        'Content-Disposition': 'attachment; filename="mo-assistant-final.apk.tar.gz"',
        'Content-Length': stats.size,
        'X-Package-Size': `${fileSizeMB} MB`,
        'X-Package-Info': 'MO APP DEVELOPMENT - Final Production APK',
        'X-Build-Type': 'Production APK for Phone Installation',
        'X-Features': 'Complete platform, Error handling, Optimized performance',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      });

      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    } catch (error: any) {
      res.status(500).json({ message: 'Download failed', error: error.message });
    }
  });

  // Source code download route
  app.get("/api/download/source-code", (req, res) => {
    try {
      // Try the complete package first
      let filePath = path.join(process.cwd(), 'mo-app-development-complete.tar.gz');
      
      // Fallback to the original if it doesn't exist
      if (!fs.existsSync(filePath)) {
        filePath = path.join(process.cwd(), 'mo-app-development-source-code.tar.gz');
      }
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ 
          message: 'Source code package not found',
          instructions: 'Creating package...',
          downloadUrl: 'Try refreshing in a moment'
        });
      }

      const stats = fs.statSync(filePath);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

      res.set({
        'Content-Type': 'application/gzip',
        'Content-Disposition': 'attachment; filename="mo-app-development-source-code.tar.gz"',
        'Content-Length': stats.size,
        'X-Package-Size': `${fileSizeMB} MB`,
        'X-Package-Info': 'MO APP DEVELOPMENT - Complete Source Code',
        'X-Build-Type': 'GitHub Repository Package',
        'X-Features': 'Complete project, README, Git configuration, All modules',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      });

      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    } catch (error: any) {
      res.status(500).json({ message: 'Download failed', error: error.message });
    }
  });

  // Authentication routes
  app.post("/api/auth/login", passport.authenticate('local'), (req, res) => {
    res.json({ 
      user: {
        id: (req.user as any).id,
        username: (req.user as any).username,
        role: (req.user as any).role
      },
      message: 'Login successful' 
    });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logout successful' });
    });
  });

  app.get("/api/auth/status", (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ 
        authenticated: true,
        user: {
          id: (req.user as any).id,
          username: (req.user as any).username,
          role: (req.user as any).role
        }
      });
    } else {
      res.json({ authenticated: false });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, email } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password required' });
      }

      // Check if user exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      // Create new user (in production, hash the password)
      const newUser = await storage.createUser({
        username,
        password, // In production, use bcrypt to hash this
        email: email || null,
        role: 'user',
        isActive: true
      });

      // Auto-login after registration
      req.login(newUser, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Registration successful but login failed' });
        }
        res.json({ 
          user: {
            id: newUser.id,
            username: newUser.username,
            role: newUser.role
          },
          message: 'Registration successful' 
        });
      });
    } catch (error: any) {
      res.status(500).json({ message: 'Registration failed' });
    }
  });

  // AI Assistant routes (protected)
  app.post("/api/ai/generate-code", requireAuth, async (req, res) => {
    try {
      const { prompt, language, mode } = req.body;
      
      if (!prompt || !language || !mode) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const result = await generateCode({ prompt, language, mode });
      
      // Save conversation
      await storage.createAiConversation({
        message: prompt,
        response: result.code,
        mode: mode
      });

      res.json(result);
    } catch (error: any) {
      console.error('Code generation error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/ai/explain-code", requireAuth, async (req, res) => {
    try {
      const { code, language } = req.body;
      
      if (!code || !language) {
        return res.status(400).json({ message: "Missing code or language" });
      }

      const explanation = await explainCode(code, language);
      res.json({ explanation });
    } catch (error: any) {
      console.error('Code explanation error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/ai/generate-commands", requireAuth, async (req, res) => {
    try {
      const { description } = req.body;
      
      if (!description) {
        return res.status(400).json({ message: "Missing description" });
      }

      const commands = await generateTermuxCommands(description);
      res.json({ commands });
    } catch (error: any) {
      console.error('Command generation error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/ai/generate-automation", requireAuth, async (req, res) => {
    try {
      const { task, platform } = req.body;
      
      if (!task || !platform) {
        return res.status(400).json({ message: "Missing task or platform" });
      }

      const script = await generateAutomationScript(task, platform);
      res.json({ script });
    } catch (error: any) {
      console.error('Automation generation error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Code Snippets routes
  app.get("/api/code-snippets", requireAuth, async (req, res) => {
    try {
      const snippets = await storage.getCodeSnippets();
      res.json(snippets);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/code-snippets", requireAuth, async (req, res) => {
    try {
      const validatedData = insertCodeSnippetSchema.parse(req.body);
      const snippet = await storage.createCodeSnippet(validatedData);
      res.json(snippet);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/code-snippets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCodeSnippetSchema.partial().parse(req.body);
      const snippet = await storage.updateCodeSnippet(id, validatedData);
      
      if (!snippet) {
        return res.status(404).json({ message: "Code snippet not found" });
      }
      
      res.json(snippet);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/code-snippets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCodeSnippet(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Code snippet not found" });
      }
      
      res.json({ message: "Code snippet deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Projects routes
  app.get("/api/projects", requireAuth, async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/projects/templates", async (req, res) => {
    try {
      const templates = await storage.getProjectTemplates();
      res.json(templates);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      res.json(project);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Automation Tasks routes
  app.get("/api/automation-tasks", requireAuth, async (req, res) => {
    try {
      const tasks = await storage.getAutomationTasks();
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/automation-tasks", async (req, res) => {
    try {
      const validatedData = insertAutomationTaskSchema.parse(req.body);
      const task = await storage.createAutomationTask(validatedData);
      res.json(task);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/automation-tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertAutomationTaskSchema.partial().parse(req.body);
      const task = await storage.updateAutomationTask(id, validatedData);
      
      if (!task) {
        return res.status(404).json({ message: "Automation task not found" });
      }
      
      res.json(task);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // AI Conversations routes
  app.get("/api/ai/conversations", async (req, res) => {
    try {
      const conversations = await storage.getAiConversations();
      res.json(conversations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Social Profiles routes
  app.get("/api/social-profiles", requireAuth, async (req, res) => {
    try {
      const profiles = await storage.getSocialProfiles();
      res.json(profiles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/social-profiles", async (req, res) => {
    try {
      const validatedData = insertSocialProfileSchema.parse(req.body);
      const profile = await storage.createSocialProfile(validatedData);
      res.json(profile);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/social-profiles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertSocialProfileSchema.partial().parse(req.body);
      const profile = await storage.updateSocialProfile(id, validatedData);
      
      if (!profile) {
        return res.status(404).json({ message: "Social profile not found" });
      }
      
      res.json(profile);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/social-profiles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteSocialProfile(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Social profile not found" });
      }
      
      res.json({ message: "Social profile deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Campaigns routes
  app.get("/api/campaigns", async (req, res) => {
    try {
      const campaigns = await storage.getCampaigns();
      res.json(campaigns);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/campaigns", async (req, res) => {
    try {
      const validatedData = insertCampaignSchema.parse(req.body);
      const campaign = await storage.createCampaign(validatedData);
      res.json(campaign);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Documents routes
  app.get("/api/documents", requireAuth, async (req, res) => {
    try {
      const documents = await storage.getDocuments();
      res.json(documents);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/documents", async (req, res) => {
    try {
      const validatedData = insertDocumentSchema.parse(req.body);
      const document = await storage.createDocument(validatedData);
      res.json(document);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteDocument(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.json({ message: "Document deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Command History routes
  app.get("/api/command-history", requireAuth, async (req, res) => {
    try {
      const history = await storage.getCommandHistory();
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/command-history", async (req, res) => {
    try {
      const validatedData = insertCommandHistorySchema.parse(req.body);
      const command = await storage.createCommandHistory(validatedData);
      res.json(command);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Scheduled Tasks routes
  app.get("/api/scheduled-tasks", async (req, res) => {
    try {
      const tasks = await storage.getScheduledTasks();
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/scheduled-tasks", async (req, res) => {
    try {
      const validatedData = insertScheduledTaskSchema.parse(req.body);
      const task = await storage.createScheduledTask(validatedData);
      res.json(task);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Reel creation routes
  app.post("/api/reels/create", async (req, res) => {
    try {
      const projectData = req.body;
      
      // Mock response for reel creation
      const mockResult = {
        success: true,
        projectId: Math.random().toString(36).substr(2, 9),
        status: "processing",
        message: "Reel creation started with AI voice generation"
      };
      
      res.json(mockResult);
    } catch (error: any) {
      console.error('Reel creation error:', error);
      res.status(500).json({ error: 'Failed to create reel' });
    }
  });

  app.post("/api/reels/generate-script", async (req, res) => {
    try {
      const { topic } = req.body;
      
      // Mock AI script generation
      const scripts = [
        "Transform your ideas into reality with MO APP DEVELOPMENT. Our AI-powered platform makes mobile development accessible to everyone, no coding experience required.",
        "Ready to dominate social media? MO APP gives you the tools to automate posting, analyze engagement, and grow your audience across all platforms simultaneously.",
        "Stop wasting time on repetitive tasks. MO APP's automation suite handles your social media, email marketing, and content creation while you focus on growing your business."
      ];
      
      const selectedScript = scripts[Math.floor(Math.random() * scripts.length)];
      
      res.json({ 
        success: true,
        script: selectedScript
      });
    } catch (error: any) {
      console.error('Script generation error:', error);
      res.status(500).json({ error: 'Failed to generate script' });
    }
  });

  // Content Recommendation Engine routes
  app.get("/api/recommendations", async (req, res) => {
    try {
      const { userId = "1", platforms = "instagram,youtube,email" } = req.query;
      
      // Mock recommendations - would integrate with ContentRecommendationService
      const mockRecommendations = [
        {
          id: "1",
          type: "content",
          module: "Instagram Manager",
          title: "Post Reels During Peak Hours",
          description: "Your audience is 73% more active between 7-9 PM. Schedule your reels during this window for maximum engagement.",
          impact: "high",
          priority: 95,
          confidence: 0.87,
          estimatedBoost: "+45% engagement",
          actionRequired: "Update posting schedule",
          createdAt: "2 hours ago",
          status: "pending"
        }
      ];
      
      res.json(mockRecommendations);
    } catch (error: any) {
      console.error('Error fetching recommendations:', error);
      res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
  });

  app.post("/api/recommendations/generate", async (req, res) => {
    try {
      const { userId, platforms, industry } = req.body;
      
      // Mock generation response
      res.json({ 
        success: true,
        count: 7,
        message: "New recommendations generated based on latest data"
      });
    } catch (error: any) {
      console.error('Error generating recommendations:', error);
      res.status(500).json({ error: 'Failed to generate recommendations' });
    }
  });

  app.post("/api/recommendations/:id/apply", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Mock apply response
      res.json({ 
        success: true,
        message: "Recommendation applied successfully"
      });
    } catch (error: any) {
      console.error('Error applying recommendation:', error);
      res.status(500).json({ error: 'Failed to apply recommendation' });
    }
  });

  app.get("/api/trends", async (req, res) => {
    try {
      const { industry = "mobile development", platforms = "all" } = req.query;
      
      // Mock trending topics
      const mockTrends = [
        {
          id: "1",
          topic: "AI-powered mobile development",
          category: "Technology",
          trendScore: 95,
          platform: "All platforms",
          growth: 156,
          relevanceScore: 0.92,
          suggestedContent: [
            "Tutorial: Building apps with AI assistance",
            "Reel: AI vs traditional coding comparison",
            "Blog: The future of mobile development"
          ]
        }
      ];
      
      res.json(mockTrends);
    } catch (error: any) {
      console.error('Error fetching trends:', error);
      res.status(500).json({ error: 'Failed to fetch trends' });
    }
  });

  app.get("/api/insights", async (req, res) => {
    try {
      const { timeframe = "30d" } = req.query;
      
      // Mock performance insights
      const mockInsights = [
        {
          id: "1",
          metric: "Instagram Engagement Rate",
          currentValue: 4.2,
          previousValue: 3.1,
          change: 35.5,
          recommendation: "Your engagement is trending upward. Focus on video content which shows 67% higher engagement.",
          actionItems: [
            "Increase video content to 70% of posts",
            "Use trending audio in reels",
            "Post consistently during peak hours"
          ]
        }
      ];
      
      res.json(mockInsights);
    } catch (error: any) {
      console.error('Error fetching insights:', error);
      res.status(500).json({ error: 'Failed to fetch insights' });
    }
  });

  // Termux Shadow Controller routes
  app.post("/api/shadow/command", async (req, res) => {
    try {
      const commandData = req.body;
      
      // Mock command execution
      const commandId = Math.random().toString(36).substr(2, 9);
      
      res.json({
        success: true,
        commandId,
        status: "pending",
        message: "Shadow command dispatched to Termux bot"
      });
    } catch (error: any) {
      console.error('Shadow command error:', error);
      res.status(500).json({ error: 'Failed to execute shadow command' });
    }
  });

  app.post("/api/shadow/toggle", async (req, res) => {
    try {
      const { enabled } = req.body;
      
      res.json({
        success: true,
        shadowMode: enabled,
        message: enabled ? "Shadow mode activated" : "Shadow mode deactivated"
      });
    } catch (error: any) {
      console.error('Shadow toggle error:', error);
      res.status(500).json({ error: 'Failed to toggle shadow mode' });
    }
  });

  app.get("/api/shadow/status", async (req, res) => {
    try {
      // Mock device status
      const mockStatus = {
        connected: true,
        deviceId: "emulator-5554",
        shadowMode: false,
        installedApps: 4,
        runningCommands: 0,
        commandsExecuted: 23,
        successRate: 94.5
      };
      
      res.json(mockStatus);
    } catch (error: any) {
      console.error('Shadow status error:', error);
      res.status(500).json({ error: 'Failed to get shadow status' });
    }
  });

  app.get("/api/shadow/apps", async (req, res) => {
    try {
      // Mock installed apps
      const mockApps = [
        {
          name: "Instagram",
          package: "com.instagram.android",
          installed: true,
          version: "302.0.0.23.114",
          lastUsed: "5 minutes ago",
          automationEnabled: true,
          commonActions: ["like", "comment", "follow", "story_view", "scroll"]
        },
        {
          name: "WhatsApp",
          package: "com.whatsapp",
          installed: true,
          version: "2.24.1.78",
          lastUsed: "1 hour ago",
          automationEnabled: true,
          commonActions: ["send_message", "read_message", "voice_message", "media_send"]
        }
      ];
      
      res.json(mockApps);
    } catch (error: any) {
      console.error('Shadow apps error:', error);
      res.status(500).json({ error: 'Failed to get app list' });
    }
  });

  app.get("/api/shadow/history", async (req, res) => {
    try {
      // Mock command history
      const mockHistory = [
        {
          id: "1",
          app: "Instagram",
          action: "like",
          target: "latest_post",
          duration: 500,
          delay: 1000,
          status: "completed",
          createdAt: "2 minutes ago",
          executedAt: "1 minute ago",
          result: "Successfully liked 3 posts"
        }
      ];
      
      res.json(mockHistory);
    } catch (error: any) {
      console.error('Shadow history error:', error);
      res.status(500).json({ error: 'Failed to get command history' });
    }
  });

  // Offline Development Environment routes
  app.get("/api/offline-dev/status", async (req, res) => {
    try {
      const [dockerStatus, services, torStatus] = await Promise.all([
        offlineDevService.checkDockerInstallation(),
        offlineDevService.getServicesStatus(),
        offlineDevService.getTorStatus()
      ]);

      res.json({
        docker: dockerStatus,
        services,
        tor: torStatus,
        totalServices: services.length,
        runningServices: services.filter(s => s.status === 'running').length
      });
    } catch (error: any) {
      console.error('Offline dev status error:', error);
      res.status(500).json({ error: 'Failed to get offline dev status' });
    }
  });

  app.post("/api/offline-dev/install", async (req, res) => {
    try {
      const result = await offlineDevService.installOfflineStack();
      res.json(result);
    } catch (error: any) {
      console.error('Offline dev install error:', error);
      res.status(500).json({ error: 'Failed to install offline dev stack' });
    }
  });

  app.post("/api/offline-dev/tor/toggle", async (req, res) => {
    try {
      const { enabled } = req.body;
      const result = await offlineDevService.enableTor(enabled);
      res.json(result);
    } catch (error: any) {
      console.error('Tor toggle error:', error);
      res.status(500).json({ error: 'Failed to toggle Tor' });
    }
  });

  app.post("/api/offline-dev/vps/deploy", async (req, res) => {
    try {
      const vpsConfig = req.body;
      const result = await offlineDevService.deployToVPS(vpsConfig);
      res.json(result);
    } catch (error: any) {
      console.error('VPS deploy error:', error);
      res.status(500).json({ error: 'Failed to deploy to VPS' });
    }
  });

  app.get("/api/offline-dev/setup-instructions", async (req, res) => {
    try {
      const instructions = await offlineDevService.generateSetupInstructions();
      res.json(instructions);
    } catch (error: any) {
      console.error('Setup instructions error:', error);
      res.status(500).json({ error: 'Failed to get setup instructions' });
    }
  });

  app.get("/api/offline-dev/download/docker-compose", async (req, res) => {
    try {
      const dockerCompose = await offlineDevService.exportDockerCompose();
      res.setHeader('Content-Type', 'text/yaml');
      res.setHeader('Content-Disposition', 'attachment; filename="docker-compose.yml"');
      res.send(dockerCompose);
    } catch (error: any) {
      console.error('Docker compose download error:', error);
      res.status(500).json({ error: 'Failed to download docker-compose.yml' });
    }
  });

  app.get("/api/offline-dev/download/setup-script", async (req, res) => {
    try {
      const setupScript = await offlineDevService.exportSetupScript();
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', 'attachment; filename="setup-offline-environment.sh"');
      res.send(setupScript);
    } catch (error: any) {
      console.error('Setup script download error:', error);
      res.status(500).json({ error: 'Failed to download setup script' });
    }
  });

  // AI Media Generation routes
  app.post("/api/ai-media/generate", async (req, res) => {
    try {
      const { type, prompt, settings } = req.body;
      
      if (!type || !prompt) {
        return res.status(400).json({ error: 'Type and prompt are required' });
      }

      // Mock response - would integrate with Python AI service
      const mockResult = {
        success: true,
        projectId: Math.random().toString(36).substr(2, 9),
        status: "generating",
        type,
        prompt,
        settings,
        estimatedTime: type === 'video' ? '2-3 minutes' : type === 'voice' ? '30 seconds' : '1-2 minutes',
        startedAt: new Date().toISOString()
      };
      
      res.json(mockResult);
    } catch (error: any) {
      console.error('AI media generation error:', error);
      res.status(500).json({ error: 'Failed to start generation' });
    }
  });

  app.get("/api/ai-media/projects", async (req, res) => {
    try {
      // Mock projects data
      const mockProjects = [
        {
          id: "1",
          name: "Mobile App Demo Video",
          type: "video",
          status: "completed",
          prompt: "Create a modern app demo showcasing MO development features",
          output: "https://example.com/video1.mp4",
          duration: 45,
          createdAt: "2 hours ago"
        },
        {
          id: "2", 
          name: "AI Voice Narration",
          type: "voice",
          status: "completed",
          prompt: "Professional narration for marketing video",
          output: "https://example.com/voice1.mp3",
          duration: 30,
          createdAt: "1 hour ago"
        },
        {
          id: "3",
          name: "Product Feature Image",
          type: "image", 
          status: "generating",
          prompt: "Sleek mobile development workspace with coding interface",
          createdAt: "10 minutes ago"
        }
      ];
      
      res.json(mockProjects);
    } catch (error: any) {
      console.error('Error fetching AI media projects:', error);
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  });

  app.get("/api/ai-media/project/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Mock project details
      const mockProject = {
        id,
        name: "Sample Project",
        type: "video",
        status: "completed",
        prompt: "Create a professional demo video",
        output: "https://example.com/output.mp4",
        duration: 60,
        settings: {
          resolution: "1080p",
          style: "modern",
          fps: 30
        },
        createdAt: "1 hour ago",
        completedAt: "30 minutes ago"
      };
      
      res.json(mockProject);
    } catch (error: any) {
      console.error('Error fetching project details:', error);
      res.status(500).json({ error: 'Failed to fetch project details' });
    }
  });

  app.delete("/api/ai-media/project/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Mock deletion
      res.json({
        success: true,
        message: `Project ${id} deleted successfully`
      });
    } catch (error: any) {
      console.error('Error deleting project:', error);
      res.status(500).json({ error: 'Failed to delete project' });
    }
  });

  // AI Bot Management routes
  app.post("/api/ai-bots/create", async (req, res) => {
    try {
      const { name, description, type, model, personality, instructions, capabilities } = req.body;
      
      if (!name || !description || !type) {
        return res.status(400).json({ error: 'Name, description, and type are required' });
      }

      // Mock bot creation
      const mockBot = {
        success: true,
        botId: Math.random().toString(36).substr(2, 9),
        name,
        description,
        type,
        status: "inactive",
        model: model || "claude-4",
        personality: personality || "professional",
        instructions: instructions || "",
        capabilities: capabilities || [],
        createdAt: new Date().toISOString()
      };
      
      res.json(mockBot);
    } catch (error: any) {
      console.error('Bot creation error:', error);
      res.status(500).json({ error: 'Failed to create bot' });
    }
  });

  app.get("/api/ai-bots", async (req, res) => {
    try {
      // Mock bots data
      const mockBots = [
        {
          id: "1",
          name: "MO Development Assistant",
          description: "AI coding assistant specialized in mobile app development",
          type: "assistant",
          status: "active",
          model: "claude-4",
          capabilities: ["coding", "debugging", "architecture", "deployment"],
          personality: "professional",
          usage_stats: {
            interactions: 1250,
            uptime: "99.8%",
            success_rate: 96.5,
            last_active: "2 minutes ago"
          },
          created_at: "2024-01-15",
          updated_at: "2024-01-23"
        },
        {
          id: "2",
          name: "Social Media Manager Bot",
          description: "Automated social media content creation and scheduling",
          type: "automation",
          status: "active",
          model: "gpt-4o",
          capabilities: ["content-creation", "scheduling", "analytics", "engagement"],
          personality: "creative",
          usage_stats: {
            interactions: 850,
            uptime: "98.2%",
            success_rate: 94.1,
            last_active: "5 minutes ago"
          },
          created_at: "2024-01-10",
          updated_at: "2024-01-22"
        }
      ];
      
      res.json(mockBots);
    } catch (error: any) {
      console.error('Error fetching bots:', error);
      res.status(500).json({ error: 'Failed to fetch bots' });
    }
  });

  app.get("/api/ai-bots/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Mock bot details
      const mockBot = {
        id,
        name: "Sample Bot",
        description: "AI assistant for development tasks",
        type: "assistant",
        status: "active",
        model: "claude-4",
        personality: "professional",
        instructions: "You are a helpful AI assistant specialized in development tasks...",
        capabilities: ["coding", "debugging", "documentation"],
        integrations: ["github", "slack"],
        usage_stats: {
          interactions: 500,
          uptime: "99.5%",
          success_rate: 95.2,
          last_active: "1 minute ago"
        },
        created_at: "2024-01-15",
        updated_at: "2024-01-23"
      };
      
      res.json(mockBot);
    } catch (error: any) {
      console.error('Error fetching bot details:', error);
      res.status(500).json({ error: 'Failed to fetch bot details' });
    }
  });

  app.post("/api/ai-bots/:id/start", async (req, res) => {
    try {
      const { id } = req.params;
      
      res.json({
        success: true,
        message: `Bot ${id} started successfully`,
        status: "active"
      });
    } catch (error: any) {
      console.error('Error starting bot:', error);
      res.status(500).json({ error: 'Failed to start bot' });
    }
  });

  app.post("/api/ai-bots/:id/stop", async (req, res) => {
    try {
      const { id } = req.params;
      
      res.json({
        success: true,
        message: `Bot ${id} stopped successfully`,
        status: "inactive"
      });
    } catch (error: any) {
      console.error('Error stopping bot:', error);
      res.status(500).json({ error: 'Failed to stop bot' });
    }
  });

  app.post("/api/ai-bots/:id/message", async (req, res) => {
    try {
      const { id } = req.params;
      const { message, context } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Mock AI response
      const mockResponse = {
        success: true,
        response: "I understand your request and I'm here to help. Let me process that for you.",
        usage: {
          tokens: message.length / 4,
          cost: 0.001
        },
        timestamp: new Date().toISOString()
      };
      
      res.json(mockResponse);
    } catch (error: any) {
      console.error('Error processing message:', error);
      res.status(500).json({ error: 'Failed to process message' });
    }
  });

  app.delete("/api/ai-bots/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      res.json({
        success: true,
        message: `Bot ${id} deleted successfully`
      });
    } catch (error: any) {
      console.error('Error deleting bot:', error);
      res.status(500).json({ error: 'Failed to delete bot' });
    }
  });

  app.get("/api/ai-bots/templates", async (req, res) => {
    try {
      const templates = [
        {
          id: "dev-assistant",
          name: "Development Assistant",
          description: "AI coding companion for software development",
          type: "assistant",
          capabilities: ["coding", "debugging", "code-review", "architecture"],
          instructions_template: "You are an expert software developer with deep knowledge of modern programming languages and frameworks...",
          icon: "💻"
        },
        {
          id: "content-creator",
          name: "Content Creator Bot",
          description: "Automated content generation for social media and marketing",
          type: "automation",
          capabilities: ["content-creation", "copywriting", "seo", "hashtags"],
          instructions_template: "You are a creative content specialist focused on engaging social media posts and marketing content...",
          icon: "📝"
        }
      ];
      
      res.json(templates);
    } catch (error: any) {
      console.error('Error fetching templates:', error);
      res.status(500).json({ error: 'Failed to fetch templates' });
    }
  });

  // Self-hosting routes
  app.get("/api/self-hosting/status", async (req, res) => {
    try {
      const { selfHostingService } = await import('./services/self-hosting-service.js');
      const services = selfHostingService.getServiceStatus();
      const metrics = await selfHostingService.getSystemMetrics();
      
      res.json({
        services,
        metrics
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/self-hosting/deploy", async (req, res) => {
    try {
      const { selfHostingService } = await import('./services/self-hosting-service.js');
      const result = await selfHostingService.deployPlatform(req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/self-hosting/services/start", async (req, res) => {
    try {
      const { selfHostingService } = await import('./services/self-hosting-service.js');
      await selfHostingService.startAllServices();
      res.json({ message: "All services started" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/self-hosting/services/stop", async (req, res) => {
    try {
      const { selfHostingService } = await import('./services/self-hosting-service.js');
      await selfHostingService.stopAllServices();
      res.json({ message: "All services stopped" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/self-hosting/services/:name/restart", async (req, res) => {
    try {
      const { selfHostingService } = await import('./services/self-hosting-service.js');
      const serviceName = req.params.name;
      await selfHostingService.restartService(serviceName);
      res.json({ message: `Service ${serviceName} restarted` });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/self-hosting/auto-scaling/enable", async (req, res) => {
    try {
      const { selfHostingService } = await import('./services/self-hosting-service.js');
      await selfHostingService.enableAutoScaling();
      res.json({ message: "Auto-scaling enabled" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/self-hosting/health-checks/enable", async (req, res) => {
    try {
      const { selfHostingService } = await import('./services/self-hosting-service.js');
      await selfHostingService.enableHealthChecks();
      res.json({ message: "Health checks enabled" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/self-hosting/backup/enable", async (req, res) => {
    try {
      const { selfHostingService } = await import('./services/self-hosting-service.js');
      await selfHostingService.enableAutoBackup();
      res.json({ message: "Auto-backup enabled" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Website Manager routes
  app.get("/api/websites", async (req, res) => {
    try {
      const websites = websiteManagerService.getWebsites();
      res.json(websites);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/websites/:id", async (req, res) => {
    try {
      const website = websiteManagerService.getWebsite(req.params.id);
      if (!website) {
        return res.status(404).json({ message: "Website not found" });
      }
      res.json(website);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/websites", async (req, res) => {
    try {
      const { name, domain, template, description } = req.body;
      
      if (!name || !domain || !template) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const result = await websiteManagerService.createWebsite({
        name,
        domain,
        template,
        description
      });

      if (result.success) {
        res.json(result.website);
      } else {
        res.status(400).json({ message: result.error });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/websites/:id", async (req, res) => {
    try {
      const success = await websiteManagerService.deleteWebsite(req.params.id);
      if (success) {
        res.json({ message: "Website deleted successfully" });
      } else {
        res.status(404).json({ message: "Website not found" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/websites/:id/clone", async (req, res) => {
    try {
      const { name, domain } = req.body;
      
      if (!name || !domain) {
        return res.status(400).json({ message: "Missing name or domain" });
      }

      const result = await websiteManagerService.cloneWebsite(req.params.id, name, domain);
      
      if (result.success) {
        res.json(result.website);
      } else {
        res.status(400).json({ message: result.error });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/website-templates", async (req, res) => {
    try {
      const templates = websiteManagerService.getAvailableTemplates();
      res.json(templates);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/websites/:id/analytics", async (req, res) => {
    try {
      const { pageViews, uniqueVisitors, bounceRate } = req.body;
      
      const success = await websiteManagerService.updateWebsiteAnalytics(req.params.id, {
        pageViews,
        uniqueVisitors,
        bounceRate
      });
      
      if (success) {
        res.json({ message: "Analytics updated" });
      } else {
        res.status(404).json({ message: "Website not found" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/websites/bulk/deploy", async (req, res) => {
    try {
      const result = await websiteManagerService.deployAllWebsites();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/websites/bulk/enable-ssl", async (req, res) => {
    try {
      const result = await websiteManagerService.enableSSLForAll();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/websites/stats", async (req, res) => {
    try {
      const stats = websiteManagerService.getSystemStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // APK Manager routes
  app.get("/api/apk-files", async (req, res) => {
    try {
      const apkFiles = apkManagerService.getApkFiles();
      res.json(apkFiles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/apk-files/:id", async (req, res) => {
    try {
      const apkFile = apkManagerService.getApkFile(req.params.id);
      if (!apkFile) {
        return res.status(404).json({ message: "APK file not found" });
      }
      res.json(apkFile);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/apk-files/upload", upload.single('apk'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No APK file provided" });
      }

      const description = req.body.description || `Uploaded ${req.file.originalname}`;
      const apkFile = await apkManagerService.uploadApk(req.file, description);

      res.json(apkFile);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/apk-files/:id", async (req, res) => {
    try {
      const success = await apkManagerService.deleteApkFile(req.params.id);
      if (success) {
        res.json({ message: "APK file deleted successfully" });
      } else {
        res.status(404).json({ message: "APK file not found" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/apk-files/:id", async (req, res) => {
    try {
      const { description } = req.body;
      
      if (!description) {
        return res.status(400).json({ message: "Description is required" });
      }

      const success = await apkManagerService.updateApkDescription(req.params.id, description);
      if (success) {
        res.json({ message: "APK description updated" });
      } else {
        res.status(404).json({ message: "APK file not found" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/apk-files/:id/generate-install-url", async (req, res) => {
    try {
      const installUrl = await apkManagerService.generateInstallUrl(req.params.id);
      if (installUrl) {
        res.json({ installUrl });
      } else {
        res.status(404).json({ message: "APK file not found" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/apk-files/:id/extract-icon", async (req, res) => {
    try {
      const iconUrl = await apkManagerService.extractIcon(req.params.id);
      if (iconUrl) {
        res.json({ iconUrl });
      } else {
        res.status(404).json({ message: "APK file not found or icon extraction failed" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/apk-files/stats", async (req, res) => {
    try {
      const stats = apkManagerService.getSystemStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Remote Control Chat routes
  app.get("/api/chat-sessions", async (req, res) => {
    try {
      const sessions = remoteControlService.getSessions();
      res.json(sessions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/chat-sessions", async (req, res) => {
    try {
      const { name, apiKey } = req.body;
      const session = await remoteControlService.createSession(name, apiKey);
      res.json(session);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/chat-sessions/:id", async (req, res) => {
    try {
      const session = remoteControlService.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/chat-sessions/:id/messages", async (req, res) => {
    try {
      const session = remoteControlService.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session.messages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/chat-sessions/:id/messages", async (req, res) => {
    try {
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      const response = await remoteControlService.processMessage(req.params.id, message);
      res.json(response);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/remote-commands", async (req, res) => {
    try {
      const commands = remoteControlService.getCommands();
      res.json(commands);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/remote-execute", async (req, res) => {
    try {
      const { command, parameters } = req.body;
      if (!command) {
        return res.status(400).json({ message: "Command is required" });
      }

      const result = await remoteControlService.executeCommand(command, parameters || {});
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Lead CRM routes
  app.get("/api/contacts", async (req, res) => {
    try {
      const { search, status, source, sort } = req.query;
      const contacts = await leadCRMService.getContacts({
        search: search as string,
        status: status as string,
        source: source as string,
        sort: sort as string
      });
      res.json(contacts);
    } catch (error: any) {
      console.error('Get contacts error:', error);
      res.status(500).json({ error: 'Failed to fetch contacts' });
    }
  });

  app.get("/api/contacts/stats", async (req, res) => {
    try {
      const stats = await leadCRMService.getContactStats();
      res.json(stats);
    } catch (error: any) {
      console.error('Get contact stats error:', error);
      res.status(500).json({ error: 'Failed to fetch contact statistics' });
    }
  });

  app.get("/api/contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contact = await leadCRMService.getContact(id);
      res.json(contact);
    } catch (error: any) {
      console.error('Get contact error:', error);
      if (error.message === 'Contact not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to fetch contact' });
      }
    }
  });

  app.post("/api/contacts", async (req, res) => {
    try {
      const contactData = insertContactSchema.parse(req.body);
      const contact = await leadCRMService.createContact(contactData);
      res.json(contact);
    } catch (error: any) {
      console.error('Create contact error:', error);
      res.status(500).json({ error: 'Failed to create contact' });
    }
  });

  app.patch("/api/contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const contact = await leadCRMService.updateContact(id, updates);
      res.json(contact);
    } catch (error: any) {
      console.error('Update contact error:', error);
      if (error.message === 'Contact not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update contact' });
      }
    }
  });

  app.delete("/api/contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await leadCRMService.deleteContact(id);
      res.json({ message: 'Contact deleted successfully' });
    } catch (error: any) {
      console.error('Delete contact error:', error);
      if (error.message === 'Contact not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to delete contact' });
      }
    }
  });

  app.get("/api/contacts/export", async (req, res) => {
    try {
      const csvData = await leadCRMService.exportContacts();
      res.set({
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="contacts-${new Date().toISOString().split('T')[0]}.csv"`
      });
      res.send(csvData);
    } catch (error: any) {
      console.error('Export contacts error:', error);
      res.status(500).json({ error: 'Failed to export contacts' });
    }
  });

  // Configure multer for CSV imports
  const csvUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'text/csv' || file.originalname.toLowerCase().endsWith('.csv')) {
        cb(null, true);
      } else {
        cb(new Error('Only CSV files are allowed'));
      }
    }
  });

  app.post("/api/contacts/import", csvUpload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const csvData = req.file.buffer.toString('utf8');
      const result = await leadCRMService.importContacts(csvData);
      res.json(result);
    } catch (error: any) {
      console.error('Import contacts error:', error);
      res.status(500).json({ error: 'Failed to import contacts' });
    }
  });

  app.post("/api/contacts/:id/activities", async (req, res) => {
    try {
      const contactId = parseInt(req.params.id);
      const activityData = insertContactActivitySchema.parse({
        ...req.body,
        contactId
      });
      const activity = await leadCRMService.addContactActivity(activityData);
      res.json(activity);
    } catch (error: any) {
      console.error('Add contact activity error:', error);
      res.status(500).json({ error: 'Failed to add contact activity' });
    }
  });

  app.get("/api/contacts/:id/activities", async (req, res) => {
    try {
      const contactId = parseInt(req.params.id);
      const activities = await leadCRMService.getContactActivities(contactId);
      res.json(activities);
    } catch (error: any) {
      console.error('Get contact activities error:', error);
      res.status(500).json({ error: 'Failed to fetch contact activities' });
    }
  });

  app.get("/api/contacts/followup", async (req, res) => {
    try {
      const followUpContacts = await leadCRMService.getFollowUpContacts();
      res.json(followUpContacts);
    } catch (error: any) {
      console.error('Get follow-up contacts error:', error);
      res.status(500).json({ error: 'Failed to fetch follow-up contacts' });
    }
  });

  app.post("/api/contacts/:id/score", async (req, res) => {
    try {
      const contactId = parseInt(req.params.id);
      const score = await leadCRMService.updateLeadScore(contactId);
      res.json({ leadScore: score });
    } catch (error: any) {
      console.error('Update lead score error:', error);
      res.status(500).json({ error: 'Failed to update lead score' });
    }
  });

  app.post("/api/contacts/search", async (req, res) => {
    try {
      const { query, filters } = req.body;
      const contacts = await leadCRMService.searchContacts(query, filters);
      res.json(contacts);
    } catch (error: any) {
      console.error('Search contacts error:', error);
      res.status(500).json({ error: 'Failed to search contacts' });
    }
  });

  // Automation Marketing Engine routes
  app.post("/api/automation/command", async (req, res) => {
    try {
      const { command } = req.body;
      if (!command) {
        return res.status(400).json({ error: 'Command is required' });
      }

      const result = await automationMarketingEngine.processCommand(command);
      res.json(result);
    } catch (error: any) {
      console.error('Automation command error:', error);
      res.status(500).json({ error: error.message || 'Failed to process automation command' });
    }
  });

  app.post("/api/automation/seo", async (req, res) => {
    try {
      const { topic } = req.body;
      if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
      }

      const result = await automationMarketingEngine.generateSEOKeywords(topic);
      res.json(result);
    } catch (error: any) {
      console.error('SEO generation error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate SEO keywords' });
    }
  });

  app.post("/api/automation/emotion", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: 'Text is required' });
      }

      const result = await automationMarketingEngine.detectEmotion(text);
      res.json(result);
    } catch (error: any) {
      console.error('Emotion detection error:', error);
      res.status(500).json({ error: error.message || 'Failed to detect emotion' });
    }
  });

  app.post("/api/automation/content", async (req, res) => {
    try {
      const { niche } = req.body;
      if (!niche) {
        return res.status(400).json({ error: 'Niche is required' });
      }

      const result = await automationMarketingEngine.generateContentPack(niche);
      res.json(result);
    } catch (error: any) {
      console.error('Content generation error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate content pack' });
    }
  });

  app.post("/api/automation/strategy", async (req, res) => {
    try {
      const { type } = req.body;
      if (!type) {
        return res.status(400).json({ error: 'Strategy type is required' });
      }

      const result = await automationMarketingEngine.generateStrategy(type);
      res.json(result);
    } catch (error: any) {
      console.error('Strategy generation error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate strategy' });
    }
  });

  app.post("/api/automation/capture", async (req, res) => {
    try {
      const { name, email, phone, type, interest } = req.body;
      if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
      }

      const result = await automationMarketingEngine.captureLeadData(name, email, phone, type, interest);
      res.json(result);
    } catch (error: any) {
      console.error('Lead capture error:', error);
      res.status(500).json({ error: error.message || 'Failed to capture lead' });
    }
  });

  app.post("/api/automation/email", async (req, res) => {
    try {
      const { name, contactId } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const result = await automationMarketingEngine.generateMarketingEmail(name, contactId);
      res.json(result);
    } catch (error: any) {
      console.error('Email generation error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate email' });
    }
  });

  app.post("/api/automation/whatsapp", async (req, res) => {
    try {
      const { name, contactId } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const result = await automationMarketingEngine.generateWhatsAppCopy(name, contactId);
      res.json(result);
    } catch (error: any) {
      console.error('WhatsApp generation error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate WhatsApp copy' });
    }
  });

  // Reel Editor routes
  app.get("/api/reel-editor/projects", async (req, res) => {
    try {
      const projects = await reelEditorService.getProjects();
      res.json(projects);
    } catch (error: any) {
      console.error('Get reel projects error:', error);
      res.status(500).json({ error: 'Failed to get reel projects' });
    }
  });

  app.get("/api/reel-editor/templates", async (req, res) => {
    try {
      const templates = reelEditorService.getTemplates();
      res.json(templates);
    } catch (error: any) {
      console.error('Get reel templates error:', error);
      res.status(500).json({ error: 'Failed to get reel templates' });
    }
  });

  app.post("/api/reel-editor/create", async (req, res) => {
    try {
      const project = await reelEditorService.createProject(req.body);
      res.json(project);
    } catch (error: any) {
      console.error('Create reel project error:', error);
      res.status(500).json({ error: error.message || 'Failed to create reel project' });
    }
  });

  // Smart script generation
  app.post("/api/reel-editor/smart-script", async (req, res) => {
    try {
      const { topic, style, duration, voiceProvider } = req.body;
      const script = await reelEditorService.generateSmartScript(topic, style, duration, voiceProvider);
      res.json(script);
    } catch (error: any) {
      console.error('Smart script generation error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Voice synthesis
  app.post("/api/reel-editor/synthesize-voice", async (req, res) => {
    try {
      const { text, voiceSettings } = req.body;
      const result = await reelEditorService.synthesizeVoice(text, voiceSettings);
      res.json(result);
    } catch (error: any) {
      console.error('Voice synthesis error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Cross-Platform Poster routes
  app.get("/api/cross-platform-posts", async (req, res) => {
    try {
      const posts = await storage.getCrossPlatformPosts();
      res.json(posts);
    } catch (error: any) {
      console.error('Get cross-platform posts error:', error);
      res.status(500).json({ error: 'Failed to get cross-platform posts' });
    }
  });

  app.post("/api/cross-platform-posts", async (req, res) => {
    try {
      // Process caption and voiceover options if enabled
      let platformFormats = req.body.platformFormats || {};
      
      if (req.body.captionsEnabled) {
        platformFormats.captionOptions = {
          enabled: true,
          style: req.body.captionStyle || 'modern',
          customText: req.body.customCaptionText || null
        };
      }

      if (req.body.voiceoverEnabled) {
        platformFormats.voiceoverOptions = {
          enabled: true,
          provider: req.body.voiceProvider || 'gtts',
          settings: {
            language: req.body.voiceLanguage || 'en',
            gender: req.body.voiceGender || 'female',
            speed: req.body.voiceSpeed || 1.0
          },
          customScript: req.body.customVoiceScript || null
        };
      }
      
      const postData = {
        ...req.body,
        platformFormats
      };
      
      const post = await storage.createCrossPlatformPost(postData);
      res.json(post);
    } catch (error: any) {
      console.error('Create cross-platform post error:', error);
      res.status(500).json({ error: 'Failed to create cross-platform post' });
    }
  });

  app.post("/api/cross-platform-posts/format", async (req, res) => {
    try {
      const { content, platforms } = req.body;
      const { crossPlatformPosterService } = await import('./services/cross-platform-poster-service');
      const formats = await crossPlatformPosterService.formatContentForPlatforms(content, [], platforms);
      res.json({ success: true, formats });
    } catch (error: any) {
      console.error('Content formatting error:', error);
      res.status(500).json({ error: 'Failed to format content' });
    }
  });

  app.post("/api/cross-platform-posts/:id/post", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getCrossPlatformPost(postId);
      
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Update status to posting
      await storage.updateCrossPlatformPost(postId, { postingStatus: 'posting' });

      // Get platform credentials
      const connections = await storage.getPlatformConnections();
      const platformCredentials: Record<string, any> = {};
      
      connections.forEach(conn => {
        if (post.targetPlatforms?.includes(conn.platform)) {
          platformCredentials[conn.platform] = conn.credentials;
        }
      });

      // Execute auto-posting with caption support
      const { crossPlatformPosterService } = await import('./services/cross-platform-poster-service');
      
      // Check if enhancements are enabled in post data
      const captionOptions = (post.platformFormats as any)?.captionOptions || null;
      const voiceoverOptions = (post.platformFormats as any)?.voiceoverOptions || null;
      
      const results = (captionOptions || voiceoverOptions) ? 
        await crossPlatformPosterService.executeAutoPostingWithEnhancements(
          post.originalContent,
          post.mediaUrls || [],
          post.targetPlatforms || [],
          platformCredentials,
          {
            captions: captionOptions,
            voiceover: voiceoverOptions
          }
        ) :
        await crossPlatformPosterService.executeAutoPosting(
          post.originalContent,
          post.mediaUrls || [],
          post.targetPlatforms || [],
          platformCredentials
        );

      // Update post with results
      const allSuccessful = results.every(r => r.success);
      await storage.updateCrossPlatformPost(postId, {
        postingStatus: allSuccessful ? 'completed' : 'failed',
        postResults: { results, analytics: await crossPlatformPosterService.trackPostPerformance(results) }
      });

      res.json({ success: true, results });
    } catch (error: any) {
      console.error('Auto-posting error:', error);
      res.status(500).json({ error: 'Failed to execute auto-posting' });
    }
  });

  app.get("/api/platform-connections", async (req, res) => {
    try {
      const connections = await storage.getPlatformConnections();
      res.json(connections);
    } catch (error: any) {
      console.error('Get platform connections error:', error);
      res.status(500).json({ error: 'Failed to get platform connections' });
    }
  });

  app.post("/api/platform-connections", async (req, res) => {
    try {
      const connection = await storage.createPlatformConnection(req.body);
      res.json(connection);
    } catch (error: any) {
      console.error('Create platform connection error:', error);
      res.status(500).json({ error: 'Failed to create platform connection' });
    }
  });

  // Caption generation endpoint
  app.post("/api/cross-platform-posts/generate-captions", async (req, res) => {
    try {
      const { videoPath, captionText, style } = req.body;
      const { crossPlatformPosterService } = await import('./services/cross-platform-poster-service');
      
      const outputPath = await crossPlatformPosterService.addAnimatedCaptions(videoPath, captionText, style);
      res.json({ success: true, outputPath });
    } catch (error: any) {
      console.error('Caption generation error:', error);
      res.status(500).json({ error: 'Failed to generate captions' });
    }
  });

  // Smart caption text generation
  app.post("/api/cross-platform-posts/smart-captions", async (req, res) => {
    try {
      const { content, platform } = req.body;
      const { crossPlatformPosterService } = await import('./services/cross-platform-poster-service');
      
      const captionText = await crossPlatformPosterService.generateSmartCaptions(content, platform);
      res.json({ success: true, captionText });
    } catch (error: any) {
      console.error('Smart caption generation error:', error);
      res.status(500).json({ error: 'Failed to generate smart captions' });
    }
  });

  // Voiceover generation endpoint
  app.post("/api/cross-platform-posts/generate-voiceover", async (req, res) => {
    try {
      const { videoPath, voiceText, voiceSettings } = req.body;
      const { crossPlatformPosterService } = await import('./services/cross-platform-poster-service');
      
      const outputPath = await crossPlatformPosterService.addAIVoiceover(videoPath, voiceText, voiceSettings);
      res.json({ success: true, outputPath });
    } catch (error: any) {
      console.error('Voiceover generation error:', error);
      res.status(500).json({ error: 'Failed to generate voiceover' });
    }
  });

  // Smart voiceover script generation
  app.post("/api/cross-platform-posts/smart-voiceover", async (req, res) => {
    try {
      const { content, platform, duration } = req.body;
      const { crossPlatformPosterService } = await import('./services/cross-platform-poster-service');
      
      const voiceScript = await crossPlatformPosterService.generateSmartVoiceoverScript(content, platform, duration);
      res.json({ success: true, voiceScript });
    } catch (error: any) {
      console.error('Smart voiceover script generation error:', error);
      res.status(500).json({ error: 'Failed to generate voiceover script' });
    }
  });

  app.post("/api/reel-editor/generate", async (req, res) => {
    try {
      const { projectId } = req.body;
      if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required' });
      }

      // Start generation asynchronously
      reelEditorService.generateReel(projectId).catch(error => {
        console.error('Reel generation error:', error);
      });

      res.json({ message: 'Reel generation started', projectId });
    } catch (error: any) {
      console.error('Start reel generation error:', error);
      res.status(500).json({ error: error.message || 'Failed to start reel generation' });
    }
  });

  app.get("/api/reel-editor/projects/:id", async (req, res) => {
    try {
      const project = await reelEditorService.getProject(req.params.id);
      res.json(project);
    } catch (error: any) {
      console.error('Get reel project error:', error);
      res.status(500).json({ error: error.message || 'Failed to get reel project' });
    }
  });

  app.delete("/api/reel-editor/projects/:id", async (req, res) => {
    try {
      const result = await reelEditorService.deleteProject(req.params.id);
      res.json(result);
    } catch (error: any) {
      console.error('Delete reel project error:', error);
      res.status(500).json({ error: error.message || 'Failed to delete reel project' });
    }
  });

  // Serve reel output files
  app.get('/uploads/reel-outputs/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(process.cwd(), 'uploads', 'reel-outputs', filename);
    
    res.download(filePath, (err) => {
      if (err) {
        console.error('File download error:', err);
        res.status(404).json({ error: 'File not found' });
      }
    });
  });

  // Analytics routes
  app.get("/api/analytics", async (req, res) => {
    try {
      const analyticsData = await analyticsService.getAnalyticsData();
      res.json(analyticsData);
    } catch (error: any) {
      console.error('Analytics data error:', error);
      res.status(500).json({ error: 'Failed to get analytics data' });
    }
  });

  app.get("/api/analytics/realtime", async (req, res) => {
    try {
      const realtimeStats = await analyticsService.getRealtimeStats();
      res.json(realtimeStats);
    } catch (error: any) {
      console.error('Realtime stats error:', error);
      res.status(500).json({ error: 'Failed to get realtime stats' });
    }
  });

  app.get("/api/analytics/module/:moduleName", async (req, res) => {
    try {
      const moduleAnalytics = await analyticsService.getModuleAnalytics(req.params.moduleName);
      res.json(moduleAnalytics);
    } catch (error: any) {
      console.error('Module analytics error:', error);
      res.status(500).json({ error: 'Failed to get module analytics' });
    }
  });

  app.get("/api/analytics/export", async (req, res) => {
    try {
      const format = req.query.format as 'json' | 'csv';
      if (!format || !['json', 'csv'].includes(format)) {
        return res.status(400).json({ error: 'Invalid format. Use json or csv.' });
      }

      const exportData = await analyticsService.exportAnalytics(format);
      
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=analytics.csv');
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=analytics.json');
      }
      
      res.send(exportData);
    } catch (error: any) {
      console.error('Analytics export error:', error);
      res.status(500).json({ error: 'Failed to export analytics data' });
    }
  });

  // Performance monitoring routes
  app.get("/api/performance/metrics", async (req, res) => {
    try {
      const metrics = await performanceOptimizer.getPerformanceMetrics();
      res.json(metrics);
    } catch (error: any) {
      console.error('Performance metrics error:', error);
      res.status(500).json({ error: 'Failed to get performance metrics' });
    }
  });

  app.get("/api/performance/optimization-report", async (req, res) => {
    try {
      const report = await performanceOptimizer.generateOptimizationReport();
      res.json(report);
    } catch (error: any) {
      console.error('Optimization report error:', error);
      res.status(500).json({ error: 'Failed to generate optimization report' });
    }
  });

  app.get("/api/performance/health", async (req, res) => {
    try {
      const health = await performanceOptimizer.getHealthStatus();
      res.json(health);
    } catch (error: any) {
      console.error('Health status error:', error);
      res.status(500).json({ error: 'Failed to get health status' });
    }
  });

  app.post("/api/performance/auto-optimize", async (req, res) => {
    try {
      const result = await performanceOptimizer.autoOptimize();
      res.json(result);
    } catch (error: any) {
      console.error('Auto optimization error:', error);
      res.status(500).json({ error: 'Failed to auto-optimize system' });
    }
  });

  // Content Strategy routes
  app.get("/api/content-strategy/templates", async (req, res) => {
    try {
      const templates = await contentStrategyService.getTemplateStrategies();
      res.json(templates);
    } catch (error: any) {
      console.error('Template fetch error:', error);
      res.status(500).json({ error: 'Failed to get strategy templates' });
    }
  });

  app.post("/api/content-strategy/generate", async (req, res) => {
    try {
      const strategy = await contentStrategyService.generateStrategy(req.body);
      res.json(strategy);
    } catch (error: any) {
      console.error('Strategy generation error:', error);
      res.status(500).json({ error: 'Failed to generate content strategy' });
    }
  });

  app.get("/api/content-strategy", async (req, res) => {
    try {
      const strategies = await contentStrategyService.getStrategies();
      res.json(strategies);
    } catch (error: any) {
      console.error('Strategies fetch error:', error);
      res.status(500).json({ error: 'Failed to get strategies' });
    }
  });

  app.get("/api/content-strategy/:id", async (req, res) => {
    try {
      const strategy = await contentStrategyService.getStrategyById(req.params.id);
      if (!strategy) {
        return res.status(404).json({ error: 'Strategy not found' });
      }
      res.json(strategy);
    } catch (error: any) {
      console.error('Strategy fetch error:', error);
      res.status(500).json({ error: 'Failed to get strategy' });
    }
  });

  app.post("/api/content-strategy/:id/save", async (req, res) => {
    try {
      await contentStrategyService.saveStrategy(req.body);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Strategy save error:', error);
      res.status(500).json({ error: 'Failed to save strategy' });
    }
  });

  app.delete("/api/content-strategy/:id", async (req, res) => {
    try {
      const success = await contentStrategyService.deleteStrategy(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Strategy not found' });
      }
      res.json({ success: true });
    } catch (error: any) {
      console.error('Strategy delete error:', error);
      res.status(500).json({ error: 'Failed to delete strategy' });
    }
  });

  // SEO Optimizer routes
  app.post("/api/seo/keywords", async (req, res) => {
    try {
      const keywords = await seoOptimizerService.generateKeywordStrategy(req.body);
      res.json(keywords);
    } catch (error: any) {
      console.error('Keyword generation error:', error);
      res.status(500).json({ error: 'Failed to generate keywords' });
    }
  });

  app.post("/api/seo/optimize-content", async (req, res) => {
    try {
      const optimization = await seoOptimizerService.optimizeContent(req.body);
      res.json(optimization);
    } catch (error: any) {
      console.error('Content optimization error:', error);
      res.status(500).json({ error: 'Failed to optimize content' });
    }
  });

  app.get("/api/seo/analytics", async (req, res) => {
    try {
      const analytics = await seoOptimizerService.getAnalytics();
      res.json(analytics);
    } catch (error: any) {
      console.error('SEO analytics error:', error);
      res.status(500).json({ error: 'Failed to get SEO analytics' });
    }
  });

  app.post("/api/seo/strategy", async (req, res) => {
    try {
      const strategy = await seoOptimizerService.generateSEOStrategy(req.body);
      res.json(strategy);
    } catch (error: any) {
      console.error('SEO strategy error:', error);
      res.status(500).json({ error: 'Failed to generate SEO strategy' });
    }
  });

  // GIF Editor routes
  app.post("/api/gif-editor/edit", async (req, res) => {
    try {
      const { effect, inputPath, outputPath, duration, fps, quality, filters } = req.body;
      
      if (!effect || !inputPath) {
        return res.status(400).json({ error: 'Effect and input path are required' });
      }

      const result = await gifEditorService.editGif({
        effect,
        inputPath,
        outputPath,
        duration,
        fps,
        quality,
        filters
      });

      res.json(result);
    } catch (error: any) {
      console.error('GIF editing error:', error);
      res.status(500).json({ error: 'Failed to edit GIF' });
    }
  });

  app.get("/api/gif-editor/effects", async (req, res) => {
    try {
      const effects = await gifEditorService.getAvailableEffects();
      res.json({ effects });
    } catch (error: any) {
      console.error('Get GIF effects error:', error);
      res.status(500).json({ error: 'Failed to get available effects' });
    }
  });

  // Clip Sort routes
  app.post("/api/clip-sort/sort", async (req, res) => {
    try {
      const result = await clipSortService.sortClips();
      res.json(result);
    } catch (error: any) {
      console.error('Clip sorting error:', error);
      res.status(500).json({ error: 'Failed to sort clips' });
    }
  });

  app.get("/api/clip-sort/niches", async (req, res) => {
    try {
      const niches = await clipSortService.getAvailableNiches();
      res.json({ niches });
    } catch (error: any) {
      console.error('Get niches error:', error);
      res.status(500).json({ error: 'Failed to get available niches' });
    }
  });

  app.get("/api/clip-sort/emotions", async (req, res) => {
    try {
      const emotions = await clipSortService.getAvailableEmotions();
      res.json({ emotions });
    } catch (error: any) {
      console.error('Get emotions error:', error);
      res.status(500).json({ error: 'Failed to get available emotions' });
    }
  });

  app.get("/api/clip-sort/by-niche/:niche", async (req, res) => {
    try {
      const { niche } = req.params;
      const clips = await clipSortService.getClipsByNiche(niche);
      res.json({ clips });
    } catch (error: any) {
      console.error('Get clips by niche error:', error);
      res.status(500).json({ error: 'Failed to get clips by niche' });
    }
  });

  app.get("/api/clip-sort/by-emotion/:emotion", async (req, res) => {
    try {
      const { emotion } = req.params;
      const clips = await clipSortService.getClipsByEmotion(emotion);
      res.json({ clips });
    } catch (error: any) {
      console.error('Get clips by emotion error:', error);
      res.status(500).json({ error: 'Failed to get clips by emotion' });
    }
  });

  // Mobile Control routes
  app.post("/api/mobile-control/execute", async (req, res) => {
    try {
      const { app, action, target, text, coordinates, delay, humanBehavior } = req.body;
      
      if (!app || !action) {
        return res.status(400).json({ error: 'App and action are required' });
      }

      const result = await mobileControlService.controlApp({
        app,
        action,
        target,
        text,
        coordinates,
        delay,
        humanBehavior
      });

      res.json(result);
    } catch (error: any) {
      console.error('Mobile control error:', error);
      res.status(500).json({ error: 'Failed to execute mobile control' });
    }
  });

  app.get("/api/mobile-control/supported-apps", async (req, res) => {
    try {
      const apps = await mobileControlService.getSupportedApps();
      res.json({ apps });
    } catch (error: any) {
      console.error('Get supported apps error:', error);
      res.status(500).json({ error: 'Failed to get supported apps' });
    }
  });

  app.get("/api/mobile-control/app-config/:app", async (req, res) => {
    try {
      const { app } = req.params;
      const config = await mobileControlService.getAppConfig(app);
      
      if (!config) {
        return res.status(404).json({ error: 'App configuration not found' });
      }

      res.json({ config });
    } catch (error: any) {
      console.error('Get app config error:', error);
      res.status(500).json({ error: 'Failed to get app configuration' });
    }
  });

  app.get("/api/mobile-control/adb-status", async (req, res) => {
    try {
      const status = await mobileControlService.checkAdbConnection();
      res.json(status);
    } catch (error: any) {
      console.error('Check ADB status error:', error);
      res.status(500).json({ error: 'Failed to check ADB status' });
    }
  });

  // Calendar Generator routes
  app.post("/api/calendar/generate", async (req, res) => {
    try {
      const { niche, customPreferences } = req.body;
      
      if (!niche) {
        return res.status(400).json({ error: 'Niche is required' });
      }

      const calendar = await calendarGeneratorService.generateMonthlyCalendar(niche, customPreferences);
      res.json(calendar);
    } catch (error: any) {
      console.error('Calendar generation error:', error);
      res.status(500).json({ error: 'Failed to generate calendar' });
    }
  });

  app.get("/api/calendar/niches", async (req, res) => {
    try {
      const niches = await calendarGeneratorService.getAvailableNiches();
      res.json({ niches });
    } catch (error: any) {
      console.error('Get niches error:', error);
      res.status(500).json({ error: 'Failed to get available niches' });
    }
  });

  app.get("/api/calendar/saved", async (req, res) => {
    try {
      const calendars = await calendarGeneratorService.getSavedCalendars();
      res.json({ calendars });
    } catch (error: any) {
      console.error('Get saved calendars error:', error);
      res.status(500).json({ error: 'Failed to get saved calendars' });
    }
  });

  app.get("/api/calendar/load/:filename", async (req, res) => {
    try {
      const { filename } = req.params;
      const calendar = await calendarGeneratorService.loadCalendar(filename);
      
      if (!calendar) {
        return res.status(404).json({ error: 'Calendar not found' });
      }

      res.json(calendar);
    } catch (error: any) {
      console.error('Load calendar error:', error);
      res.status(500).json({ error: 'Failed to load calendar' });
    }
  });

  // Trends Scraper routes
  app.get("/api/trends/google", async (req, res) => {
    try {
      const { category, region, timeframe, limit } = req.query;
      
      const trends = await trendsScraperService.scrapeGoogleTrends({
        category: category as string,
        region: region as string,
        timeframe: timeframe as '1h' | '4h' | '1d' | '7d' | '30d',
        limit: limit ? parseInt(limit as string) : undefined
      });

      res.json({ trends });
    } catch (error: any) {
      console.error('Google Trends scraping error:', error);
      res.status(500).json({ error: 'Failed to scrape Google Trends' });
    }
  });

  app.get("/api/trends/youtube", async (req, res) => {
    try {
      const { category, region, limit } = req.query;
      
      const trends = await trendsScraperService.scrapeYouTubeTrends({
        category: category as string,
        region: region as string,
        limit: limit ? parseInt(limit as string) : undefined
      });

      res.json({ trends });
    } catch (error: any) {
      console.error('YouTube Trends scraping error:', error);
      res.status(500).json({ error: 'Failed to scrape YouTube Trends' });
    }
  });

  app.get("/api/trends/analysis", async (req, res) => {
    try {
      const { categories, region, includeYouTube } = req.query;
      
      const categoriesArray = categories ? (categories as string).split(',') : undefined;
      const includeYT = includeYouTube === 'true';

      const analysis = await trendsScraperService.getComprehensiveAnalysis({
        categories: categoriesArray,
        region: region as string,
        includeYouTube: includeYT
      });

      res.json(analysis);
    } catch (error: any) {
      console.error('Trends analysis error:', error);
      res.status(500).json({ error: 'Failed to generate trends analysis' });
    }
  });

  app.get("/api/trends/categories", async (req, res) => {
    try {
      const categories = await trendsScraperService.getAvailableCategories();
      res.json({ categories });
    } catch (error: any) {
      console.error('Get categories error:', error);
      res.status(500).json({ error: 'Failed to get available categories' });
    }
  });

  app.get("/api/trends/regions", async (req, res) => {
    try {
      const regions = await trendsScraperService.getAvailableRegions();
      res.json({ regions });
    } catch (error: any) {
      console.error('Get regions error:', error);
      res.status(500).json({ error: 'Failed to get available regions' });
    }
  });

  app.get("/api/trends/saved", async (req, res) => {
    try {
      const analyses = await trendsScraperService.getSavedAnalyses();
      res.json({ analyses });
    } catch (error: any) {
      console.error('Get saved analyses error:', error);
      res.status(500).json({ error: 'Failed to get saved analyses' });
    }
  });

  app.get("/api/trends/load/:filename", async (req, res) => {
    try {
      const { filename } = req.params;
      const analysis = await trendsScraperService.loadAnalysis(filename);
      
      if (!analysis) {
        return res.status(404).json({ error: 'Analysis not found' });
      }

      res.json(analysis);
    } catch (error: any) {
      console.error('Load analysis error:', error);
      res.status(500).json({ error: 'Failed to load analysis' });
    }
  });

  // Competitor Benchmarking routes
  app.get("/api/competitors/industries", async (req, res) => {
    try {
      const industries = await competitorBenchmarkingService.getAvailableIndustries();
      res.json({ industries });
    } catch (error: any) {
      console.error('Get industries error:', error);
      res.status(500).json({ error: 'Failed to get available industries' });
    }
  });

  app.get("/api/competitors/:industry", async (req, res) => {
    try {
      const { industry } = req.params;
      const competitors = await competitorBenchmarkingService.getCompetitorsByIndustry(industry);
      res.json({ competitors });
    } catch (error: any) {
      console.error('Get competitors error:', error);
      res.status(500).json({ error: 'Failed to get competitors' });
    }
  });

  app.get("/api/competitors/:industry/:competitorId/analyze", async (req, res) => {
    try {
      const { industry, competitorId } = req.params;
      const analysis = await competitorBenchmarkingService.analyzeCompetitor(competitorId, industry);
      res.json(analysis);
    } catch (error: any) {
      console.error('Competitor analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze competitor' });
    }
  });

  app.post("/api/competitors/benchmark", async (req, res) => {
    try {
      const { industry, region, includeAll } = req.body;
      
      const report = await competitorBenchmarkingService.generateBenchmarkReport({
        industry,
        region,
        includeAll
      });

      res.json(report);
    } catch (error: any) {
      console.error('Benchmark report error:', error);
      res.status(500).json({ error: 'Failed to generate benchmark report' });
    }
  });

  app.get("/api/competitors/reports", async (req, res) => {
    try {
      const reports = await competitorBenchmarkingService.getSavedReports();
      res.json({ reports });
    } catch (error: any) {
      console.error('Get saved reports error:', error);
      res.status(500).json({ error: 'Failed to get saved reports' });
    }
  });

  app.get("/api/competitors/reports/:filename", async (req, res) => {
    try {
      const { filename } = req.params;
      const report = await competitorBenchmarkingService.loadReport(filename);
      
      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }

      res.json(report);
    } catch (error: any) {
      console.error('Load report error:', error);
      res.status(500).json({ error: 'Failed to load report' });
    }
  });

  // Auto Blog Writer routes
  app.post("/api/blog-writer/generate", async (req, res) => {
    try {
      const blog = autoBlogWriterService.generateBlogPost(req.body);
      res.json(blog);
    } catch (error: any) {
      console.error('Blog generation error:', error);
      res.status(500).json({ error: 'Failed to generate blog post' });
    }
  });

  app.post("/api/blog-writer/generate-multiple", async (req, res) => {
    try {
      const { keywords, ...baseRequest } = req.body;
      
      if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
        return res.status(400).json({ error: 'Keywords array is required' });
      }

      const blogs = autoBlogWriterService.generateMultipleBlogs(keywords, baseRequest);
      res.json({ blogs });
    } catch (error: any) {
      console.error('Multiple blog generation error:', error);
      res.status(500).json({ error: 'Failed to generate multiple blog posts' });
    }
  });

  app.post("/api/blog-writer/seo-suggestions/:id", async (req, res) => {
    try {
      const blogPost = req.body;
      const suggestions = autoBlogWriterService.generateSEOSuggestions(blogPost);
      res.json({ suggestions });
    } catch (error: any) {
      console.error('SEO suggestions error:', error);
      res.status(500).json({ error: 'Failed to generate SEO suggestions' });
    }
  });

  app.get("/api/blog-writer/templates", async (req, res) => {
    try {
      const templates = {
        targetLengths: [
          { value: 'short', label: 'Short (500-800 words)', description: 'Quick read articles' },
          { value: 'medium', label: 'Medium (800-1500 words)', description: 'Standard blog posts' },
          { value: 'long', label: 'Long (1500+ words)', description: 'Comprehensive guides' }
        ],
        tones: [
          { value: 'professional', label: 'Professional', description: 'Formal business tone' },
          { value: 'casual', label: 'Casual', description: 'Friendly conversational tone' },
          { value: 'informative', label: 'Informative', description: 'Educational and detailed' },
          { value: 'persuasive', label: 'Persuasive', description: 'Marketing-focused content' }
        ],
        categories: [
          'technology', 'business', 'lifestyle', 'education', 'entertainment', 'general'
        ]
      };
      res.json(templates);
    } catch (error: any) {
      console.error('Templates fetch error:', error);
      res.status(500).json({ error: 'Failed to get blog templates' });
    }
  });

  // Project download endpoint
  app.get("/api/download/project", async (req, res) => {
    try {
      const downloadPath = '/tmp/mo-app-development-complete.tar.gz';
      
      // Check if download file exists
      if (!fs.existsSync(downloadPath)) {
        return res.status(404).json({ error: 'Download file not found' });
      }

      // Set headers for download
      res.setHeader('Content-Type', 'application/gzip');
      res.setHeader('Content-Disposition', 'attachment; filename="mo-app-development-complete.tar.gz"');
      
      // Stream the file
      const fileStream = fs.createReadStream(downloadPath);
      fileStream.pipe(res);
    } catch (error: any) {
      console.error('Download error:', error);
      res.status(500).json({ error: 'Failed to download project' });
    }
  });

  // APK package download endpoint
  app.get("/api/download/apk-package", async (req, res) => {
    try {
      const apkPackagePath = 'mo-app-development-apk-package.tar.gz';
      
      // Check if APK package exists
      if (!fs.existsSync(apkPackagePath)) {
        return res.status(404).json({ error: 'APK package not found' });
      }

      // Set headers for download
      res.setHeader('Content-Type', 'application/gzip');
      res.setHeader('Content-Disposition', 'attachment; filename="mo-app-development-apk-package.tar.gz"');
      
      // Stream the file
      const fileStream = fs.createReadStream(apkPackagePath);
      fileStream.pipe(res);
    } catch (error: any) {
      console.error('APK package download error:', error);
      res.status(500).json({ error: 'Failed to download APK package' });
    }
  });

  // Google Drive upload endpoint
  app.post("/api/upload/google-drive", async (req, res) => {
    try {
      const result = await googleDriveService.uploadProjectToGoogleDrive();
      res.json(result);
    } catch (error: any) {
      console.error('Google Drive upload error:', error);
      res.status(500).json({ error: 'Failed to upload to Google Drive' });
    }
  });

  // Get Google Drive upload instructions
  app.get("/api/upload/google-drive/instructions", async (req, res) => {
    try {
      const instructions = await googleDriveService.createPublicUploadLink();
      res.json(instructions);
    } catch (error: any) {
      console.error('Google Drive instructions error:', error);
      res.status(500).json({ error: 'Failed to get upload instructions' });
    }
  });

  // Serve uploaded APK files
  const uploadsPath = path.join(process.cwd(), 'uploads');
  app.use('/uploads', (req, res, next) => {
    if (req.path.endsWith('.apk')) {
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', `attachment; filename="${req.path.split('/').pop()}"`);
    }
    next();
  });

  const httpServer = createServer(app);
  return httpServer;
}
