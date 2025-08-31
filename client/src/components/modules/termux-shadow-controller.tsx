import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Smartphone, 
  Target, 
  Play,
  Square,
  Eye,
  EyeOff,
  Zap,
  Settings,
  Code,
  Activity,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Pause,
  RotateCcw,
  Navigation,
  MessageSquare,
  Heart,
  Share,
  Camera,
  Search
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ShadowCommand {
  id: string;
  app: string;
  action: string;
  target?: string;
  coordinates?: { x: number; y: number };
  text?: string;
  duration: number;
  delay: number;
  status: "pending" | "running" | "completed" | "failed";
  createdAt: string;
  executedAt?: string;
  result?: string;
}

interface AppProfile {
  name: string;
  package: string;
  installed: boolean;
  version: string;
  lastUsed: string;
  automationEnabled: boolean;
  commonActions: string[];
}

interface AutomationScript {
  id: string;
  name: string;
  app: string;
  description: string;
  commands: ShadowCommand[];
  schedule?: string;
  enabled: boolean;
  lastRun?: string;
  successRate: number;
}

export function TermuxShadowController() {
  const [activeTab, setActiveTab] = useState("control");
  const [selectedApp, setSelectedApp] = useState<string>("");
  const [shadowMode, setShadowMode] = useState<boolean>(false);
  const [newCommand, setNewCommand] = useState({
    app: "",
    action: "tap",
    target: "",
    coordinates: { x: 0, y: 0 },
    text: "",
    duration: 1000,
    delay: 500
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock data for installed apps
  const installedApps: AppProfile[] = [
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
    },
    {
      name: "YouTube",
      package: "com.google.android.youtube",
      installed: true,
      version: "18.48.39",
      lastUsed: "30 minutes ago",
      automationEnabled: true,
      commonActions: ["like_video", "subscribe", "comment", "watch", "search"]
    },
    {
      name: "Telegram",
      package: "org.telegram.messenger",
      installed: true,
      version: "10.2.5",
      lastUsed: "2 hours ago",
      automationEnabled: false,
      commonActions: ["send_message", "forward", "react", "join_channel"]
    }
  ];

  // Mock command history
  const commandHistory: ShadowCommand[] = [
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
    },
    {
      id: "2",
      app: "WhatsApp",
      action: "send_message",
      target: "contact:John",
      text: "Hey! Checking out this new app development tool 🔥",
      duration: 2000,
      delay: 500,
      status: "completed",
      createdAt: "15 minutes ago",
      executedAt: "14 minutes ago",
      result: "Message sent successfully"
    },
    {
      id: "3",
      app: "YouTube",
      action: "subscribe",
      target: "channel:TechTutorials",
      duration: 1000,
      delay: 2000,
      status: "running",
      createdAt: "5 minutes ago",
      result: "In progress..."
    }
  ];

  // Mock automation scripts
  const automationScripts: AutomationScript[] = [
    {
      id: "1",
      name: "Instagram Engagement Bot",
      app: "Instagram",
      description: "Automatically like and comment on posts with relevant hashtags",
      commands: [],
      schedule: "Every 30 minutes",
      enabled: true,
      lastRun: "10 minutes ago",
      successRate: 94.5
    },
    {
      id: "2",
      name: "WhatsApp Auto Responder",
      app: "WhatsApp",
      description: "Send automated replies to business inquiries",
      commands: [],
      schedule: "Instant",
      enabled: true,
      lastRun: "2 minutes ago",
      successRate: 98.2
    },
    {
      id: "3",
      name: "YouTube Growth Script",
      app: "YouTube",
      description: "Subscribe to relevant channels and engage with content",
      commands: [],
      schedule: "Daily at 8 AM",
      enabled: false,
      lastRun: "Yesterday",
      successRate: 87.1
    }
  ];

  const executeCommand = useMutation({
    mutationFn: async (commandData: any) => {
      // Would send encrypted command to Termux shadow service
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true, commandId: Math.random().toString(36).substr(2, 9) };
    },
    onSuccess: (data) => {
      toast({
        title: "Command Sent",
        description: `Shadow command ${data.commandId} dispatched to Termux bot.`,
      });
      setNewCommand({
        app: "",
        action: "tap",
        target: "",
        coordinates: { x: 0, y: 0 },
        text: "",
        duration: 1000,
        delay: 500
      });
    },
  });

  const toggleShadowMode = useMutation({
    mutationFn: async (enabled: boolean) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, shadowMode: enabled };
    },
    onSuccess: (data) => {
      setShadowMode(data.shadowMode);
      toast({
        title: data.shadowMode ? "Shadow Mode Enabled" : "Shadow Mode Disabled",
        description: data.shadowMode 
          ? "MO is now operating invisibly in the background" 
          : "Shadow operations have been stopped",
      });
    },
  });

  const installTermuxService = useMutation({
    mutationFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 3000));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Termux Service Installed",
        description: "Shadow controller is ready for autonomous mobile automation.",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "running":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "failed":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "tap":
      case "click":
        return <Target className="w-4 h-4" />;
      case "like":
        return <Heart className="w-4 h-4" />;
      case "comment":
      case "send_message":
        return <MessageSquare className="w-4 h-4" />;
      case "share":
        return <Share className="w-4 h-4" />;
      case "search":
        return <Search className="w-4 h-4" />;
      case "camera":
      case "photo":
        return <Camera className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  return (
    <Card className="bg-surface border-surface-variant">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-red-400" />
            <span>Termux Shadow Controller</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={shadowMode ? "bg-red-500/10 text-red-400" : "bg-gray-500/10 text-gray-400"}>
              {shadowMode ? (
                <>
                  <EyeOff className="w-3 h-3 mr-1" />
                  Shadow Active
                </>
              ) : (
                <>
                  <Eye className="w-3 h-3 mr-1" />
                  Visible Mode
                </>
              )}
            </Badge>
            <Button
              size="sm"
              onClick={() => toggleShadowMode.mutate(!shadowMode)}
              disabled={toggleShadowMode.isPending}
              className={shadowMode ? "bg-red-500 hover:bg-red-600" : "bg-gray-500 hover:bg-gray-600"}
            >
              <Shield className="w-3 h-3 mr-1" />
              Toggle
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-surface-variant">
            <TabsTrigger value="control" className="text-xs">Control</TabsTrigger>
            <TabsTrigger value="apps" className="text-xs">Apps</TabsTrigger>
            <TabsTrigger value="scripts" className="text-xs">Scripts</TabsTrigger>
            <TabsTrigger value="history" className="text-xs">History</TabsTrigger>
          </TabsList>

          <TabsContent value="control" className="space-y-4">
            <div className="bg-surface-variant rounded-lg p-3 space-y-3">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-red-400" />
                <span className="text-sm font-medium">Execute Command</span>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium mb-1 block">Target App</label>
                    <Select 
                      value={newCommand.app} 
                      onValueChange={(value) => setNewCommand(prev => ({ ...prev, app: value }))}
                    >
                      <SelectTrigger className="bg-dark border-surface-variant">
                        <SelectValue placeholder="Select app..." />
                      </SelectTrigger>
                      <SelectContent>
                        {installedApps.filter(app => app.automationEnabled).map((app) => (
                          <SelectItem key={app.package} value={app.name}>
                            {app.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Action</label>
                    <Select 
                      value={newCommand.action} 
                      onValueChange={(value) => setNewCommand(prev => ({ ...prev, action: value }))}
                    >
                      <SelectTrigger className="bg-dark border-surface-variant">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tap">Tap/Click</SelectItem>
                        <SelectItem value="swipe">Swipe</SelectItem>
                        <SelectItem value="type">Type Text</SelectItem>
                        <SelectItem value="like">Like Post</SelectItem>
                        <SelectItem value="comment">Comment</SelectItem>
                        <SelectItem value="follow">Follow</SelectItem>
                        <SelectItem value="send_message">Send Message</SelectItem>
                        <SelectItem value="scroll">Scroll</SelectItem>
                        <SelectItem value="back">Back</SelectItem>
                        <SelectItem value="home">Home</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {(newCommand.action === "type" || newCommand.action === "comment" || newCommand.action === "send_message") && (
                  <div>
                    <label className="text-xs font-medium mb-1 block">Text Content</label>
                    <Textarea
                      placeholder="Enter text to type..."
                      value={newCommand.text}
                      onChange={(e) => setNewCommand(prev => ({ ...prev, text: e.target.value }))}
                      className="bg-dark border-surface-variant resize-none"
                      rows={3}
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium mb-1 block">Target Element (optional)</label>
                  <Input
                    placeholder="CSS selector, element ID, or description..."
                    value={newCommand.target}
                    onChange={(e) => setNewCommand(prev => ({ ...prev, target: e.target.value }))}
                    className="bg-dark border-surface-variant"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium mb-1 block">Duration (ms)</label>
                    <Input
                      type="number"
                      placeholder="1000"
                      value={newCommand.duration}
                      onChange={(e) => setNewCommand(prev => ({ ...prev, duration: parseInt(e.target.value) || 1000 }))}
                      className="bg-dark border-surface-variant"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Delay (ms)</label>
                    <Input
                      type="number"
                      placeholder="500"
                      value={newCommand.delay}
                      onChange={(e) => setNewCommand(prev => ({ ...prev, delay: parseInt(e.target.value) || 500 }))}
                      className="bg-dark border-surface-variant"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => executeCommand.mutate(newCommand)}
                    disabled={!newCommand.app || !newCommand.action || executeCommand.isPending}
                    className="bg-red-500 hover:bg-red-600 flex-1"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {executeCommand.isPending ? "Executing..." : "Execute Command"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setNewCommand({
                      app: "",
                      action: "tap",
                      target: "",
                      coordinates: { x: 0, y: 0 },
                      text: "",
                      duration: 1000,
                      delay: 500
                    })}
                    className="px-3"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {shadowMode && (
              <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <EyeOff className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-medium text-red-400">Shadow Mode Active</span>
                </div>
                <p className="text-xs text-text-secondary">
                  MO is operating invisibly. All automation commands are executed in stealth mode 
                  with randomized delays and human-like behavior patterns.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="apps" className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Installed Apps</span>
              <Badge className="bg-blue-500/10 text-blue-400 text-xs">
                {installedApps.filter(app => app.automationEnabled).length} / {installedApps.length} enabled
              </Badge>
            </div>

            <div className="space-y-3">
              {installedApps.map((app) => (
                <div
                  key={app.package}
                  className="bg-surface-variant rounded-lg p-3"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium">{app.name}</h4>
                        <Badge className={app.automationEnabled 
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                        }>
                          {app.automationEnabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                      <div className="text-xs text-text-secondary space-y-1">
                        <p>Package: {app.package}</p>
                        <p>Version: {app.version}</p>
                        <p>Last used: {app.lastUsed}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => setSelectedApp(app.name)}
                      >
                        Configure
                      </Button>
                    </div>
                  </div>

                  <div className="bg-dark rounded p-2">
                    <div className="text-xs font-medium mb-2">Available Actions:</div>
                    <div className="flex flex-wrap gap-1">
                      {app.commonActions.map((action) => (
                        <Badge
                          key={action}
                          variant="outline"
                          className="text-xs flex items-center space-x-1"
                        >
                          {getActionIcon(action)}
                          <span>{action.replace('_', ' ')}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="scripts" className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Automation Scripts</span>
              <Button size="sm" className="bg-purple-500 hover:bg-purple-600">
                <Code className="w-3 h-3 mr-1" />
                Create Script
              </Button>
            </div>

            <div className="space-y-3">
              {automationScripts.map((script) => (
                <div
                  key={script.id}
                  className="bg-surface-variant rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-sm font-medium">{script.name}</h4>
                        <Badge className={script.enabled 
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                        }>
                          {script.enabled ? "Active" : "Paused"}
                        </Badge>
                        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                          {script.app}
                        </Badge>
                      </div>
                      <p className="text-xs text-text-secondary mb-3">
                        {script.description}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-text-secondary">
                        <span>Schedule: {script.schedule}</span>
                        <span>Last run: {script.lastRun}</span>
                        <span className="flex items-center space-x-1">
                          <Activity className="w-3 h-3" />
                          <span>{script.successRate}% success</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      className={script.enabled ? "bg-yellow-500 hover:bg-yellow-600" : "bg-green-500 hover:bg-green-600"}
                    >
                      {script.enabled ? (
                        <>
                          <Pause className="w-3 h-3 mr-1" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 mr-1" />
                          Start
                        </>
                      )}
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs">
                      <Settings className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs">
                      <Navigation className="w-3 h-3 mr-1" />
                      Test
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Command History</span>
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-500/10 text-green-400 text-xs">
                  {commandHistory.filter(cmd => cmd.status === 'completed').length} completed
                </Badge>
                <Button size="sm" variant="outline" className="text-xs">
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Refresh
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {commandHistory.map((command) => (
                <div
                  key={command.id}
                  className="bg-surface-variant rounded-lg p-3"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {getActionIcon(command.action)}
                        <span className="text-sm font-medium">
                          {command.action.replace('_', ' ')} in {command.app}
                        </span>
                        <Badge className={getStatusColor(command.status)}>
                          {command.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {command.status === 'running' && <Activity className="w-3 h-3 mr-1 animate-pulse" />}
                          {command.status === 'failed' && <XCircle className="w-3 h-3 mr-1" />}
                          {command.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                          {command.status}
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-text-secondary space-y-1">
                        {command.target && <p>Target: {command.target}</p>}
                        {command.text && <p>Text: "{command.text}"</p>}
                        <p>Created: {command.createdAt}</p>
                        {command.executedAt && <p>Executed: {command.executedAt}</p>}
                        {command.result && (
                          <p className="text-blue-400">Result: {command.result}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium text-red-400">Termux Shadow Features</span>
          </div>
          <ul className="text-xs text-text-secondary space-y-1">
            <li>• Invisible automation with human-like behavior patterns</li>
            <li>• Encrypted command transmission for maximum security</li>
            <li>• Multi-app coordination for complex workflows</li>
            <li>• Smart delay randomization to avoid detection</li>
            <li>• Screenshot-based element detection and interaction</li>
            <li>• Automatic error recovery and retry mechanisms</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}