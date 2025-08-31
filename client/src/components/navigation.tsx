import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Shield, Settings, Globe, User } from "lucide-react";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  
  return (
    <header className="bg-surface border-b border-surface-variant sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-semibold">MO APP DEVELOPMENT</h1>
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
            <Globe className="w-3 h-3 mr-1" />
            Public Access
          </Badge>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse mr-1" />
            Platform Online
          </Badge>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <User className="w-4 h-4" />
            <span>Guest User</span>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
          >
            <Settings className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Quick Access Tabs */}
      <div className="flex overflow-x-auto scrollbar-hide px-4 pb-2">
        <Button
          variant={activeTab === "dashboard" ? "default" : "ghost"}
          size="sm"
          onClick={() => onTabChange("dashboard")}
          className={`mr-2 whitespace-nowrap ${
            activeTab === "dashboard" 
              ? "bg-primary/10 text-primary hover:bg-primary/20" 
              : "hover:bg-surface-variant"
          }`}
        >
          <span className="mr-2">🏠</span>
          Dashboard
        </Button>
        <Button
          variant={activeTab === "seo-manager" ? "default" : "ghost"}
          size="sm"
          onClick={() => onTabChange("seo-manager")}
          className={`mr-2 whitespace-nowrap ${
            activeTab === "seo-manager" 
              ? "bg-primary/10 text-primary hover:bg-primary/20" 
              : "hover:bg-surface-variant"
          }`}
        >
          <span className="mr-2">🔍</span>
          SEO Manager
        </Button>
        <Button
          variant={activeTab === "seo-optimizer" ? "default" : "ghost"}
          size="sm"
          onClick={() => onTabChange("seo-optimizer")}
          className={`mr-2 whitespace-nowrap ${
            activeTab === "seo-optimizer" 
              ? "bg-primary/10 text-primary hover:bg-primary/20" 
              : "hover:bg-surface-variant"
          }`}
        >
          <span className="mr-2">🚀</span>
          SEO Optimizer
        </Button>
        <Button
          variant={activeTab === "social-media" ? "default" : "ghost"}
          size="sm"
          onClick={() => onTabChange("social-media")}
          className={`mr-2 whitespace-nowrap ${
            activeTab === "social-media" 
              ? "bg-primary/10 text-primary hover:bg-primary/20" 
              : "hover:bg-surface-variant"
          }`}
        >
          <span className="mr-2">📱</span>
          Social Media
        </Button>
        <Button
          variant={activeTab === "cross-platform-poster" ? "default" : "ghost"}
          size="sm"
          onClick={() => onTabChange("cross-platform-poster")}
          className={`mr-2 whitespace-nowrap ${
            activeTab === "cross-platform-poster" 
              ? "bg-primary/10 text-primary hover:bg-primary/20" 
              : "hover:bg-surface-variant"
          }`}
        >
          <span className="mr-2">📤</span>
          Auto-Poster
        </Button>
        <Button
          variant={activeTab === "gif-editor" ? "default" : "ghost"}
          size="sm"
          onClick={() => onTabChange("gif-editor")}
          className={`mr-2 whitespace-nowrap ${
            activeTab === "gif-editor" 
              ? "bg-primary/10 text-primary hover:bg-primary/20" 
              : "hover:bg-surface-variant"
          }`}
        >
          <span className="mr-2">🎬</span>
          GIF Editor
        </Button>
        <Button
          variant={activeTab === "clip-sort" ? "default" : "ghost"}
          size="sm"
          onClick={() => onTabChange("clip-sort")}
          className={`mr-2 whitespace-nowrap ${
            activeTab === "clip-sort" 
              ? "bg-primary/10 text-primary hover:bg-primary/20" 
              : "hover:bg-surface-variant"
          }`}
        >
          <span className="mr-2">📂</span>
          Clip Sort
        </Button>
        <Button
          variant={activeTab === "mobile-control" ? "default" : "ghost"}
          size="sm"
          onClick={() => onTabChange("mobile-control")}
          className={`mr-2 whitespace-nowrap ${
            activeTab === "mobile-control" 
              ? "bg-primary/10 text-primary hover:bg-primary/20" 
              : "hover:bg-surface-variant"
          }`}
        >
          <span className="mr-2">📱</span>
          Mobile Control
        </Button>
        <Button
          variant={activeTab === "calendar-generator" ? "default" : "ghost"}
          size="sm"
          onClick={() => onTabChange("calendar-generator")}
          className={`mr-2 whitespace-nowrap ${
            activeTab === "calendar-generator" 
              ? "bg-primary/10 text-primary hover:bg-primary/20" 
              : "hover:bg-surface-variant"
          }`}
        >
          <span className="mr-2">📅</span>
          Calendar
        </Button>
        <Button
          variant={activeTab === "trends-scraper" ? "default" : "ghost"}
          size="sm"
          onClick={() => onTabChange("trends-scraper")}
          className={`mr-2 whitespace-nowrap ${
            activeTab === "trends-scraper" 
              ? "bg-primary/10 text-primary hover:bg-primary/20" 
              : "hover:bg-surface-variant"
          }`}
        >
          <span className="mr-2">📈</span>
          Trends
        </Button>
        <Button
          variant={activeTab === "command-console" ? "default" : "ghost"}
          size="sm"
          onClick={() => onTabChange("command-console")}
          className={`mr-2 whitespace-nowrap ${
            activeTab === "command-console" 
              ? "bg-primary/10 text-primary hover:bg-primary/20" 
              : "hover:bg-surface-variant"
          }`}
        >
          <span className="mr-2">⚡</span>
          Console
        </Button>
        <Button
          variant={activeTab === "document-vault" ? "default" : "ghost"}
          size="sm"
          onClick={() => onTabChange("document-vault")}
          className={`mr-2 whitespace-nowrap ${
            activeTab === "document-vault" 
              ? "bg-primary/10 text-primary hover:bg-primary/20" 
              : "hover:bg-surface-variant"
          }`}
        >
          <span className="mr-2">🔐</span>
          ID Vault
        </Button>
        <Button
          variant={activeTab === "code-editor" ? "default" : "ghost"}
          size="sm"
          onClick={() => onTabChange("code-editor")}
          className={`mr-2 whitespace-nowrap ${
            activeTab === "code-editor" 
              ? "bg-primary/10 text-primary hover:bg-primary/20" 
              : "hover:bg-surface-variant"
          }`}
        >
          <span className="mr-2">💻</span>
          Code Editor
        </Button>
        <Button
          variant={activeTab === "whatsapp-bot" ? "default" : "ghost"}
          size="sm"
          onClick={() => onTabChange("whatsapp-bot")}
          className={`mr-2 whitespace-nowrap ${
            activeTab === "whatsapp-bot" 
              ? "bg-primary/10 text-primary hover:bg-primary/20" 
              : "hover:bg-surface-variant"
          }`}
        >
          <span className="mr-2">💬</span>
          WhatsApp
        </Button>
        <Button
          variant={activeTab === "email-marketing" ? "default" : "ghost"}
          size="sm"
          onClick={() => onTabChange("email-marketing")}
          className={`mr-2 whitespace-nowrap ${
            activeTab === "email-marketing" 
              ? "bg-primary/10 text-primary hover:bg-primary/20" 
              : "hover:bg-surface-variant"
          }`}
        >
          <span className="mr-2">📧</span>
          Email
        </Button>
        <Button
          variant={activeTab === "offline-dev-environment" ? "default" : "ghost"}
          size="sm"
          onClick={() => onTabChange("offline-dev-environment")}
          className={`mr-2 whitespace-nowrap ${
            activeTab === "offline-dev-environment" 
              ? "bg-primary/10 text-primary hover:bg-primary/20" 
              : "hover:bg-surface-variant"
          }`}
        >
          <span className="mr-2">🖥️</span>
          Offline Dev
        </Button>
        <Button
          variant={activeTab === "ai-clips-generator" ? "default" : "ghost"}
          size="sm"
          onClick={() => onTabChange("ai-clips-generator")}
          className={`mr-2 whitespace-nowrap ${
            activeTab === "ai-clips-generator" 
              ? "bg-primary/10 text-primary hover:bg-primary/20" 
              : "hover:bg-surface-variant"
          }`}
        >
          <span className="mr-2">✨</span>
          AI Media
        </Button>
        <Button
          variant={activeTab === "ai-bot-manager" ? "default" : "ghost"}
          size="sm"
          onClick={() => onTabChange("ai-bot-manager")}
          className={`mr-2 whitespace-nowrap ${
            activeTab === "ai-bot-manager" 
              ? "bg-primary/10 text-primary hover:bg-primary/20" 
              : "hover:bg-surface-variant"
          }`}
        >
          <span className="mr-2">🤖</span>
          AI Bots
        </Button>
        <Button
          variant={activeTab === "self-hosting-manager" ? "default" : "ghost"}
          size="sm"
          onClick={() => onTabChange("self-hosting-manager")}
          className={`mr-2 whitespace-nowrap ${
            activeTab === "self-hosting-manager" 
              ? "bg-primary/10 text-primary hover:bg-primary/20" 
              : "hover:bg-surface-variant"
          }`}
        >
          <span className="mr-2">🚀</span>
          Self-Hosting
        </Button>
        <Button
          variant={activeTab === "multiple-websites-manager" ? "default" : "ghost"}
          size="sm"
          onClick={() => onTabChange("multiple-websites-manager")}
          className={`mr-2 whitespace-nowrap ${
            activeTab === "multiple-websites-manager" 
              ? "bg-primary/10 text-primary hover:bg-primary/20" 
              : "hover:bg-surface-variant"
          }`}
        >
          <span className="mr-2">🌐</span>
          Multi-Sites
        </Button>
        <Button
          variant={activeTab === "apk-manager" ? "default" : "ghost"}
          size="sm"
          onClick={() => onTabChange("apk-manager")}
          className={`mr-2 whitespace-nowrap ${
            activeTab === "apk-manager" 
              ? "bg-primary/10 text-primary hover:bg-primary/20" 
              : "hover:bg-surface-variant"
          }`}
        >
          <span className="mr-2">📱</span>
          APK Manager
        </Button>
        <Button
          variant={activeTab === "remote-control-chat" ? "default" : "ghost"}
          size="sm"
          onClick={() => onTabChange("remote-control-chat")}
          className={`mr-2 whitespace-nowrap ${
            activeTab === "remote-control-chat" 
              ? "bg-primary/10 text-primary hover:bg-primary/20" 
              : "hover:bg-surface-variant"
          }`}
        >
          <span className="mr-2">💬</span>
          Remote Control
        </Button>
        <Button
          variant={activeTab === "lead-crm" ? "default" : "ghost"}
          size="sm"
          onClick={() => onTabChange("lead-crm")}
          className={`mr-2 whitespace-nowrap ${
            activeTab === "lead-crm" 
              ? "bg-primary/10 text-primary hover:bg-primary/20" 
              : "hover:bg-surface-variant"
          }`}
        >
          <span className="mr-2">👥</span>
          Lead CRM
        </Button>
        <Button
          variant={activeTab === "automation-marketing-engine" ? "default" : "ghost"}
          size="sm"
          onClick={() => onTabChange("automation-marketing-engine")}
          className={`mr-2 whitespace-nowrap ${
            activeTab === "automation-marketing-engine" 
              ? "bg-primary/10 text-primary hover:bg-primary/20" 
              : "hover:bg-surface-variant"
          }`}
        >
          <span className="mr-2">🤖</span>
          Marketing Engine
        </Button>
        <Button
          variant={activeTab === "reel-editor" ? "default" : "ghost"}
          size="sm"
          onClick={() => onTabChange("reel-editor")}
          className={`mr-2 whitespace-nowrap ${
            activeTab === "reel-editor" 
              ? "bg-primary/10 text-primary hover:bg-primary/20" 
              : "hover:bg-surface-variant"
          }`}
        >
          <span className="mr-2">🎬</span>
          Reel Editor
        </Button>
        <Button
          variant={activeTab === "analytics-dashboard" ? "default" : "ghost"}
          size="sm"
          onClick={() => onTabChange("analytics-dashboard")}
          className={`mr-2 whitespace-nowrap ${
            activeTab === "analytics-dashboard" 
              ? "bg-primary/10 text-primary hover:bg-primary/20" 
              : "hover:bg-surface-variant"
          }`}
        >
          <span className="mr-2">📊</span>
          Analytics
        </Button>
        <Button
          variant={activeTab === "performance-monitor" ? "default" : "ghost"}
          size="sm"
          onClick={() => onTabChange("performance-monitor")}
          className={`mr-2 whitespace-nowrap ${
            activeTab === "performance-monitor" 
              ? "bg-primary/10 text-primary hover:bg-primary/20" 
              : "hover:bg-surface-variant"
          }`}
        >
          <span className="mr-2">⚡</span>
          Performance
        </Button>
        <Button
          variant={activeTab === "content-strategy-generator" ? "default" : "ghost"}
          size="sm"
          onClick={() => onTabChange("content-strategy-generator")}
          className={`mr-2 whitespace-nowrap ${
            activeTab === "content-strategy-generator" 
              ? "bg-primary/10 text-primary hover:bg-primary/20" 
              : "hover:bg-surface-variant"
          }`}
        >
          <span className="mr-2">🧠</span>
          AI Strategy
        </Button>
        <Button
          variant={activeTab === "auto-blog-writer" ? "default" : "ghost"}
          size="sm"
          onClick={() => onTabChange("auto-blog-writer")}
          className={`mr-2 whitespace-nowrap ${
            activeTab === "auto-blog-writer" 
              ? "bg-primary/10 text-primary hover:bg-primary/20" 
              : "hover:bg-surface-variant"
          }`}
        >
          <span className="mr-2">✍️</span>
          Auto Blog
        </Button>
        <Button
          variant={activeTab === "templates" ? "default" : "ghost"}
          size="sm"
          onClick={() => onTabChange("templates")}
          className={`whitespace-nowrap ${
            activeTab === "templates" 
              ? "bg-primary/10 text-primary hover:bg-primary/20" 
              : "hover:bg-surface-variant"
          }`}
        >
          <span className="mr-2">📋</span>
          Templates
        </Button>
      </div>
    </header>
  );
}
