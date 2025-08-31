import { useState } from "react";
import { VoiceAssistant } from "@/components/voice-assistant";
import { AiAssistant } from "@/components/ai-assistant";
import { PhoneControl } from "@/components/phone-control";
import { CodeEditor } from "@/components/code-editor";
import { ProjectTemplates } from "@/components/project-templates";
import { PrivacySecurity } from "@/components/privacy-security";
import { SEOManager } from "@/components/modules/seo-manager";
import { SocialMediaManager } from "@/components/modules/social-media-manager";
import { CommandConsole } from "@/components/modules/command-console";
import { DocumentVault } from "@/components/modules/document-vault";
import { WhatsAppBot } from "@/components/modules/whatsapp-bot";
import { EmailMarketing } from "@/components/modules/email-marketing";
import { YouTubeManager } from "@/components/modules/youtube-manager";
import { DataAcquisition } from "@/components/modules/data-acquisition";
import { AdBudgetPlanner } from "@/components/modules/ad-budget-planner";
import { TaskScheduler } from "@/components/modules/task-scheduler";
import { ReplitIntegration } from "@/components/modules/replit-integration";
import { PackageManager } from "@/components/modules/package-manager";
import { GitIntegration } from "@/components/modules/git-integration";
import { SecretsManager } from "@/components/modules/secrets-manager";
import { DeploymentManager } from "@/components/modules/deployment-manager";
import { ContentRecommendationEngine } from "@/components/modules/content-recommendation-engine";
import { TermuxShadowController } from "@/components/modules/termux-shadow-controller";
import { OfflineDevEnvironment } from "@/components/modules/offline-dev-environment";
import { AiClipsGenerator } from "@/components/modules/ai-clips-generator";
import { AIBotManager } from "@/components/modules/ai-bot-manager";
import SelfHostingManager from "@/components/modules/self-hosting-manager";
import MultipleWebsitesManager from "@/components/modules/multiple-websites-manager";
import ApkManager from "@/components/modules/apk-manager";
import RemoteControlChat from "@/components/modules/remote-control-chat";
import LeadCRM from "@/components/modules/lead-crm";
import AutomationMarketingEngine from "@/components/modules/automation-marketing-engine";
import ReelEditor from "@/components/modules/reel-editor";
import AnalyticsDashboard from "@/components/modules/analytics-dashboard";
import PerformanceMonitor from "@/components/modules/performance-monitor";
import ContentStrategyGenerator from "@/components/modules/content-strategy-generator";
import SEOOptimizer from "@/components/modules/seo-optimizer";
import { CrossPlatformPoster } from "@/components/modules/cross-platform-poster";
import { GifEditor } from "@/components/modules/gif-editor";
import { ClipSort } from "@/components/modules/clip-sort";
import { MobileControl } from "@/components/modules/mobile-control";
import { CalendarGenerator } from "@/components/modules/calendar-generator";
import { TrendsScraper } from "@/components/modules/trends-scraper";
import AutoBlogWriter from "@/components/modules/auto-blog-writer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Smartphone, 
  Search, 
  Share2, 
  Video, 
  BarChart3, 
  Users, 
  Settings, 
  Code, 
  Globe,
  Zap,
  Bot,
  Mic
} from "lucide-react";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("overview");

  const renderCategoryContent = (category: string) => {
    switch (category) {
      case "overview":
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <VoiceAssistant />
              <AiAssistant />
            </div>
            <AnalyticsDashboard />
          </div>
        );
      
      case "mobile":
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <ApkManager />
              <PhoneControl />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <MobileControl />
              <RemoteControlChat />
            </div>
          </div>
        );
      
      case "seo":
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <SEOManager />
              <SEOOptimizer />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="trend-scraper-tabs">
                <TrendsScraper />
              </div>
              <ContentStrategyGenerator />
            </div>
          </div>
        );
      
      case "social":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SocialMediaManager />
              <CrossPlatformPoster />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <WhatsAppBot />
              <EmailMarketing />
              <YouTubeManager />
            </div>
          </div>
        );
      
      case "content":
        return (
          <div className="space-y-3 bigger-tabs">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <ReelEditor />
              <AiClipsGenerator />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <GifEditor />
              <ClipSort />
              <AutoBlogWriter />
            </div>
          </div>
        );
      
      case "automation":
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <AutomationMarketingEngine />
              <TaskScheduler />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <TermuxShadowController />
              <CommandConsole />
            </div>
          </div>
        );
      
      case "business":
        return (
          <div className="space-y-3 bigger-tabs">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 crm-tabs">
              <LeadCRM />
              <PerformanceMonitor />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <AdBudgetPlanner />
              <DataAcquisition />
              <CalendarGenerator />
            </div>
          </div>
        );
      
      case "development":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <CodeEditor />
              <AIBotManager />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <OfflineDevEnvironment />
              <SelfHostingManager />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ProjectTemplates />
              <DocumentVault />
            </div>
          </div>
        );
      
      case "deployment":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DeploymentManager />
              <MultipleWebsitesManager />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <ReplitIntegration />
              <PackageManager />
              <GitIntegration />
              <SecretsManager />
            </div>
          </div>
        );
      
      default:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <VoiceAssistant />
              <AiAssistant />
            </div>
            <AnalyticsDashboard />
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-text">
      <div className="sticky top-0 z-40 bg-white dark:bg-surface shadow border-b border-surface-variant backdrop-blur-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">MO APP DEVELOPMENT</h1>
                <p className="text-sm text-text-secondary">AI-Powered Mobile Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-500/10 text-green-400">
                <Zap className="w-3 h-3 mr-1" />
                All Systems Active
              </Badge>
              <Badge className="bg-blue-500/10 text-blue-400">
                <Bot className="w-3 h-3 mr-1" />
                AI Ready
              </Badge>
              <Badge className="bg-orange-500/10 text-orange-400">
                <Mic className="w-3 h-3 mr-1" />
                Voice Ready
              </Badge>
            </div>
          </div>
          
          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
            <TabsList className="grid w-full grid-cols-8 bg-surface-variant shadow-lg">
              <TabsTrigger value="overview" className="flex items-center space-x-2 btn-enhanced">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="mobile" className="flex items-center space-x-2 btn-enhanced">
                <Smartphone className="w-4 h-4" />
                <span className="hidden sm:inline">Mobile</span>
              </TabsTrigger>
              <TabsTrigger value="seo" className="flex items-center space-x-2 btn-enhanced">
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">SEO</span>
              </TabsTrigger>
              <TabsTrigger value="social" className="flex items-center space-x-2 btn-enhanced">
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Social</span>
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center space-x-2 btn-enhanced">
                <Video className="w-4 h-4" />
                <span className="hidden sm:inline">Content</span>
              </TabsTrigger>
              <TabsTrigger value="automation" className="flex items-center space-x-2 btn-enhanced">
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">Automation</span>
              </TabsTrigger>
              <TabsTrigger value="business" className="flex items-center space-x-2 btn-enhanced">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Business</span>
              </TabsTrigger>
              <TabsTrigger value="development" className="flex items-center space-x-2 btn-enhanced">
                <Code className="w-4 h-4" />
                <span className="hidden sm:inline">Dev</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <main className="max-w-7xl mx-auto p-2 sm:p-6">
          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full h-full">
            <TabsContent value="overview" className="mt-0 tab-content-container animate-fade-in">
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3 max-h-[80vh] overflow-y-auto">{renderCategoryContent("overview")}</div>
              </div>
            </TabsContent>
            <TabsContent value="mobile" className="mt-0 tab-content-container animate-fade-in">
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3 max-h-[80vh] overflow-y-auto">{renderCategoryContent("mobile")}</div>
              </div>
            </TabsContent>
            <TabsContent value="seo" className="mt-0 tab-content-container animate-fade-in">
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3 max-h-[80vh] overflow-y-auto">{renderCategoryContent("seo")}</div>
              </div>
            </TabsContent>
            <TabsContent value="social" className="mt-0 tab-content-container animate-fade-in">
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3 max-h-[80vh] overflow-y-auto">{renderCategoryContent("social")}</div>
              </div>
            </TabsContent>
            <TabsContent value="content" className="mt-0 tab-content-container animate-fade-in">
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3 max-h-[80vh] overflow-y-auto">{renderCategoryContent("content")}</div>
              </div>
            </TabsContent>
            <TabsContent value="automation" className="mt-0 tab-content-container animate-fade-in">
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3 max-h-[80vh] overflow-y-auto">{renderCategoryContent("automation")}</div>
              </div>
            </TabsContent>
            <TabsContent value="business" className="mt-0 tab-content-container animate-fade-in">
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3 max-h-[80vh] overflow-y-auto">{renderCategoryContent("business")}</div>
              </div>
            </TabsContent>
            <TabsContent value="development" className="mt-0 tab-content-container animate-fade-in">
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3 max-h-[80vh] overflow-y-auto">{renderCategoryContent("development")}</div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}