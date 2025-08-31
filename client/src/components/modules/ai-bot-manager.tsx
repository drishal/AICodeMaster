import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { 
  Bot,
  Brain,
  Zap,
  Settings,
  Play,
  Pause,
  Square,
  Upload,
  Download,
  Copy,
  Share2,
  Code,
  MessageSquare,
  Users,
  Activity,
  Cpu,
  Database,
  Globe,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Sparkles,
  Wrench,
  Network,
  Shield,
  Terminal,
  FileText,
  Layers,
  GitBranch,
  Server,
  CloudLightning
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AIBot {
  id: string;
  name: string;
  description: string;
  type: "assistant" | "automation" | "chatbot" | "api";
  status: "active" | "inactive" | "training" | "error";
  model: string;
  capabilities: string[];
  personality: string;
  instructions: string;
  knowledge_base: string[];
  integrations: string[];
  usage_stats: {
    interactions: number;
    uptime: string;
    success_rate: number;
    last_active: string;
  };
  created_at: string;
  updated_at: string;
}

interface BotTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  capabilities: string[];
  instructions_template: string;
  icon: string;
}

export function AIBotManager() {
  const [activeTab, setActiveTab] = useState("bots");
  const [selectedBot, setSelectedBot] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newBotData, setNewBotData] = useState({
    name: "",
    description: "",
    type: "assistant",
    model: "claude-4",
    personality: "professional",
    instructions: "",
    capabilities: [] as string[]
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock bot data
  const mockBots: AIBot[] = [
    {
      id: "1",
      name: "MO Development Assistant",
      description: "AI coding assistant specialized in mobile app development",
      type: "assistant",
      status: "active",
      model: "claude-4",
      capabilities: ["coding", "debugging", "architecture", "deployment"],
      personality: "professional",
      instructions: "Expert mobile developer with focus on React Native, Flutter, and cross-platform solutions",
      knowledge_base: ["react-native-docs", "flutter-docs", "mobile-best-practices"],
      integrations: ["github", "replit", "figma"],
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
      instructions: "Create engaging social media content optimized for different platforms with trending hashtags",
      knowledge_base: ["social-media-trends", "content-templates", "hashtag-database"],
      integrations: ["instagram", "facebook", "twitter", "linkedin"],
      usage_stats: {
        interactions: 850,
        uptime: "98.2%",
        success_rate: 94.1,
        last_active: "5 minutes ago"
      },
      created_at: "2024-01-10",
      updated_at: "2024-01-22"
    },
    {
      id: "3",
      name: "Customer Support Chatbot",
      description: "24/7 customer support with intelligent query resolution",
      type: "chatbot",
      status: "training",
      model: "claude-3.5",
      capabilities: ["support", "faq", "escalation", "multilingual"],
      personality: "helpful",
      instructions: "Provide friendly, accurate customer support with emphasis on problem resolution",
      knowledge_base: ["support-docs", "faq-database", "product-manuals"],
      integrations: ["whatsapp", "telegram", "website-chat"],
      usage_stats: {
        interactions: 320,
        uptime: "85.5%",
        success_rate: 88.7,
        last_active: "1 hour ago"
      },
      created_at: "2024-01-20",
      updated_at: "2024-01-23"
    }
  ];

  const botTemplates: BotTemplate[] = [
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
    },
    {
      id: "support-bot",
      name: "Customer Support Bot",
      description: "Intelligent customer service automation",
      type: "chatbot",
      capabilities: ["support", "faq", "ticket-routing", "multilingual"],
      instructions_template: "You are a helpful customer support representative focused on solving customer problems efficiently...",
      icon: "🎧"
    },
    {
      id: "api-integration",
      name: "API Integration Bot",
      description: "Automated API testing and integration management",
      type: "api",
      capabilities: ["api-testing", "integration", "monitoring", "documentation"],
      instructions_template: "You are an API integration specialist focused on testing, monitoring, and documenting API endpoints...",
      icon: "🔌"
    }
  ];

  const createBot = useMutation({
    mutationFn: async (botData: any) => {
      // Mock bot creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      return {
        success: true,
        botId: Math.random().toString(36).substr(2, 9),
        message: "Bot created successfully"
      };
    },
    onSuccess: () => {
      toast({
        title: "Bot Created",
        description: "Your AI bot has been created and is initializing.",
      });
      setIsCreating(false);
      setNewBotData({
        name: "",
        description: "",
        type: "assistant",
        model: "claude-4",
        personality: "professional",
        instructions: "",
        capabilities: []
      });
    },
    onError: () => {
      toast({
        title: "Creation Failed",
        description: "Failed to create bot. Please try again.",
        variant: "destructive"
      });
    }
  });

  const toggleBotStatus = useMutation({
    mutationFn: async (data: { botId: string; action: string }) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, action: data.action };
    },
    onSuccess: (data) => {
      toast({
        title: `Bot ${data.action}`,
        description: `Bot has been ${data.action}d successfully.`,
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "inactive":
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
      case "training":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "error":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "inactive": return <XCircle className="w-4 h-4 text-gray-400" />;
      case "training": return <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />;
      case "error": return <AlertCircle className="w-4 h-4 text-red-400" />;
      default: return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "assistant": return <Brain className="w-4 h-4" />;
      case "automation": return <Zap className="w-4 h-4" />;
      case "chatbot": return <MessageSquare className="w-4 h-4" />;
      case "api": return <Network className="w-4 h-4" />;
      default: return <Bot className="w-4 h-4" />;
    }
  };

  return (
    <Card className="bg-surface border-surface-variant module-enhanced">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-blue-400" />
            <span>AI Bot & App Manager Pro</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-blue-500/10 text-blue-400">
              {mockBots.length} Active Bots
            </Badge>
            <Button
              size="sm"
              onClick={() => setIsCreating(true)}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Plus className="w-4 h-4 mr-1" />
              Create Bot
            </Button>
          </div>
        </CardTitle>
        <div className="card-description">
          Advanced bot management with AI-powered automation, multi-platform deployment, 
          performance monitoring, conversation analytics, and intelligent response optimization.
        </div>
        <div className="feature-list">
          <div className="feature-tag">AI Automation</div>
          <div className="feature-tag">Multi Platform</div>
          <div className="feature-tag">Performance Monitor</div>
          <div className="feature-tag">Conversation Analytics</div>
          <div className="feature-tag">Response Optimize</div>
          <div className="feature-tag">Custom Training</div>
          <div className="feature-tag">24/7 Active</div>
          <div className="feature-tag">Smart Deploy</div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-surface-variant">
            <TabsTrigger value="bots" className="text-xs">
              <Bot className="w-3 h-3 mr-1" />
              My Bots
            </TabsTrigger>
            <TabsTrigger value="templates" className="text-xs">
              <Layers className="w-3 h-3 mr-1" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs">
              <BarChart3 className="w-3 h-3 mr-1" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs">
              <Settings className="w-3 h-3 mr-1" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bots" className="space-y-4">
            {isCreating && (
              <Card className="bg-surface-variant border-blue-500/20">
                <CardHeader>
                  <CardTitle className="text-sm">Create New AI Bot</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-text-secondary mb-1 block">Bot Name</label>
                      <Input
                        placeholder="My AI Assistant"
                        value={newBotData.name}
                        onChange={(e) => setNewBotData({...newBotData, name: e.target.value})}
                        className="bg-dark border-surface-variant"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-text-secondary mb-1 block">Type</label>
                      <Select value={newBotData.type} onValueChange={(v) => setNewBotData({...newBotData, type: v})}>
                        <SelectTrigger className="bg-dark border-surface-variant">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="assistant">AI Assistant</SelectItem>
                          <SelectItem value="automation">Automation Bot</SelectItem>
                          <SelectItem value="chatbot">Chatbot</SelectItem>
                          <SelectItem value="api">API Bot</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-text-secondary mb-1 block">Description</label>
                    <Input
                      placeholder="What does this bot do?"
                      value={newBotData.description}
                      onChange={(e) => setNewBotData({...newBotData, description: e.target.value})}
                      className="bg-dark border-surface-variant"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-text-secondary mb-1 block">AI Model</label>
                      <Select value={newBotData.model} onValueChange={(v) => setNewBotData({...newBotData, model: v})}>
                        <SelectTrigger className="bg-dark border-surface-variant">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="claude-4">Claude 4 Sonnet</SelectItem>
                          <SelectItem value="claude-3.5">Claude 3.5 Sonnet</SelectItem>
                          <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                          <SelectItem value="gpt-4">GPT-4</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs text-text-secondary mb-1 block">Personality</label>
                      <Select value={newBotData.personality} onValueChange={(v) => setNewBotData({...newBotData, personality: v})}>
                        <SelectTrigger className="bg-dark border-surface-variant">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="creative">Creative</SelectItem>
                          <SelectItem value="technical">Technical</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-text-secondary mb-1 block">Instructions & Behavior</label>
                    <Textarea
                      placeholder="Describe how the bot should behave, what it knows, and how it should respond..."
                      value={newBotData.instructions}
                      onChange={(e) => setNewBotData({...newBotData, instructions: e.target.value})}
                      className="bg-dark border-surface-variant"
                      rows={4}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => createBot.mutate(newBotData)}
                      disabled={createBot.isPending || !newBotData.name || !newBotData.description}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      {createBot.isPending ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Bot
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreating(false)}
                      disabled={createBot.isPending}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-3">
              {mockBots.map((bot) => (
                <Card key={bot.id} className="bg-surface-variant hover:bg-surface-variant/80 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                          {getTypeIcon(bot.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium truncate">{bot.name}</h3>
                            <Badge className={getStatusColor(bot.status)}>
                              {getStatusIcon(bot.status)}
                              <span className="ml-1 text-xs">{bot.status}</span>
                            </Badge>
                          </div>
                          <p className="text-sm text-text-secondary mb-2 line-clamp-2">{bot.description}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-text-secondary">
                            <div>
                              <span className="font-medium">Model:</span> {bot.model}
                            </div>
                            <div>
                              <span className="font-medium">Interactions:</span> {bot.usage_stats.interactions.toLocaleString()}
                            </div>
                            <div>
                              <span className="font-medium">Uptime:</span> {bot.usage_stats.uptime}
                            </div>
                            <div>
                              <span className="font-medium">Success:</span> {bot.usage_stats.success_rate}%
                            </div>
                          </div>

                          <div className="flex items-center space-x-1 mt-2">
                            {bot.capabilities.map((capability) => (
                              <Badge key={capability} className="bg-dark/50 text-xs">
                                {capability}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1 ml-4">
                        {bot.status === "active" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleBotStatus.mutate({botId: bot.id, action: "pause"})}
                          >
                            <Pause className="w-3 h-3" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleBotStatus.mutate({botId: bot.id, action: "start"})}
                          >
                            <Play className="w-3 h-3" />
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Settings className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {botTemplates.map((template) => (
                <Card key={template.id} className="bg-surface-variant hover:bg-surface-variant/80 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">{template.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{template.name}</h3>
                        <p className="text-sm text-text-secondary mb-3">{template.description}</p>
                        <div className="flex items-center space-x-1 mb-3">
                          {template.capabilities.slice(0, 3).map((capability) => (
                            <Badge key={capability} className="bg-dark/50 text-xs">
                              {capability}
                            </Badge>
                          ))}
                          {template.capabilities.length > 3 && (
                            <Badge className="bg-dark/50 text-xs">
                              +{template.capabilities.length - 3} more
                            </Badge>
                          )}
                        </div>
                        <Button
                          size="sm"
                          className="bg-blue-500 hover:bg-blue-600 w-full"
                          onClick={() => {
                            setNewBotData({
                              ...newBotData,
                              type: template.type,
                              instructions: template.instructions_template,
                              capabilities: template.capabilities
                            });
                            setIsCreating(true);
                          }}
                        >
                          Use Template
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-surface-variant">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-secondary">Total Interactions</p>
                      <p className="text-2xl font-bold">2,420</p>
                      <p className="text-xs text-green-400">+12% this week</p>
                    </div>
                    <Activity className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-surface-variant">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-secondary">Average Uptime</p>
                      <p className="text-2xl font-bold">98.2%</p>
                      <p className="text-xs text-blue-400">99.1% target</p>
                    </div>
                    <Server className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-surface-variant">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-secondary">Success Rate</p>
                      <p className="text-2xl font-bold">93.1%</p>
                      <p className="text-xs text-yellow-400">+2.5% improved</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-surface-variant">
              <CardHeader>
                <CardTitle className="text-sm">Bot Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockBots.map((bot) => (
                  <div key={bot.id} className="bg-dark rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{bot.name}</span>
                      <Badge className={getStatusColor(bot.status)}>
                        {bot.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-text-secondary">Interactions:</span>
                        <div className="font-medium">{bot.usage_stats.interactions.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-text-secondary">Uptime:</span>
                        <div className="font-medium">{bot.usage_stats.uptime}</div>
                      </div>
                      <div>
                        <span className="text-text-secondary">Success Rate:</span>
                        <div className="font-medium">{bot.usage_stats.success_rate}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card className="bg-surface-variant">
              <CardHeader>
                <CardTitle className="text-sm">Global Bot Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-text-secondary mb-2 block">Default AI Model</label>
                    <Select defaultValue="claude-4">
                      <SelectTrigger className="bg-dark border-surface-variant">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="claude-4">Claude 4 Sonnet</SelectItem>
                        <SelectItem value="claude-3.5">Claude 3.5 Sonnet</SelectItem>
                        <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-xs text-text-secondary mb-2 block">Auto-backup Frequency</label>
                    <Select defaultValue="daily">
                      <SelectTrigger className="bg-dark border-surface-variant">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm">Enable Analytics Tracking</span>
                    <p className="text-xs text-text-secondary">Collect usage statistics and performance metrics</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Enabled
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm">Auto-scale Resources</span>
                    <p className="text-xs text-text-secondary">Automatically allocate resources based on demand</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Enabled
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">AI Bot Management Platform</span>
          </div>
          <p className="text-xs text-text-secondary">
            Create, train, and deploy AI assistants like me. Build custom bots for development, 
            automation, customer support, and API integration. Full management dashboard with analytics and monitoring.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}