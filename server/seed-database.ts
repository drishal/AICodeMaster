import { db } from "./db";
import { 
  automationTasks, socialProfiles, projects,
  type InsertAutomationTask, type InsertSocialProfile, type InsertProject
} from "@shared/schema";

export async function seedDatabase() {
  console.log("Seeding database with initial data...");

  try {
    // Check if data already exists
    const existingTasks = await db.select().from(automationTasks).limit(1);
    if (existingTasks.length > 0) {
      console.log("Database already seeded, skipping...");
      return;
    }

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
        name: "WhatsApp Marketing Bot",
        description: "Smart message flow, filters, responder",
        type: "whatsapp-marketing",
        status: "active", 
        config: { autoResponder: true, messageFilters: true }
      },
      {
        name: "Email Marketing Engine",
        description: "Campaign creator, segmentation, analytics",
        type: "email-marketing",
        status: "idle",
        config: { segmentation: true, analytics: true }
      },
      {
        name: "YouTube Shorts Manager",
        description: "Automated content creation and engagement",
        type: "youtube-manager",
        status: "idle",
        config: { contentType: "shorts", automation: true }
      },
      {
        name: "Data Acquisition Tool",
        description: "Ethical email/number collection via APIs",
        type: "data-acquisition",
        status: "idle",
        config: { ethical: true, gdprCompliant: true }
      },
      {
        name: "Ad Budget Auto-Planner",
        description: "₹0 default with ROAS optimization",
        type: "ad-budget",
        status: "active",
        config: { defaultBudget: 0, roasOptimization: true }
      },
      {
        name: "Task Scheduler + Execution",
        description: "Cron-based automation with error handling",
        type: "task-scheduler",
        status: "active",
        config: { cronJobs: true, errorHandling: true }
      }
    ];

    await db.insert(automationTasks).values(defaultTasks);

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

    await db.insert(socialProfiles).values(defaultProfiles);

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
        config_path = Path.home() / '.automation' / 'config.json'
        if config_path.exists():
            with open(config_path, 'r') as f:
                return json.load(f)
        return {}
    
    def setup_security(self):
        # Initialize security protocols
        pass
    
    def organize_messages(self):
        # Smart message organization
        pass

if __name__ == "__main__":
    bot = PhoneAutomationBot()
    print("Phone Automation Bot initialized securely")`,
        files: {
          "main.py": "# Main automation script",
          "config.json": "# Configuration file"
        },
        isTemplate: true
      },
      {
        name: "Social Media Manager",
        description: "Multi-platform automation and content scheduling",
        template: "social-automation", 
        language: "javascript",
        code: `/**
 * Social Media Automation Framework
 * Multi-platform management with AI integration
 */

class SocialMediaManager {
    constructor() {
        this.config = this.loadConfig();
        this.setupAutomation();
    }

    loadConfig() {
        return {
            platforms: ['instagram', 'facebook', 'youtube'],
            strategy: 'engagement',
            budget: 0
        };
    }

    setupAutomation() {
        console.log("Social automation initialized");
    }

    async scheduleContent() {
        console.log("Content scheduling activated");
    }

    async analyzeEngagement() {
        console.log("Engagement analysis started");
    }
}

const manager = new SocialMediaManager();`,
        files: {
          "main.js": "# Main social automation",
          "scheduler.js": "# Content scheduler"
        },
        isTemplate: true
      }
    ];

    await db.insert(projects).values(defaultTemplates);

    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().then(() => process.exit(0));
}