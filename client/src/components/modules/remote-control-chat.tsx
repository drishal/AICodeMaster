import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Settings, 
  Key, 
  Smartphone,
  Terminal,
  Play,
  Pause,
  RefreshCw,
  Copy,
  Share,
  Eye,
  EyeOff,
  Zap,
  Globe,
  Shield,
  Code,
  Database,
  Cloud,
  Cpu,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  command?: string;
  result?: any;
  status: 'pending' | 'success' | 'error' | 'processing';
}

interface RemoteCommand {
  id: string;
  command: string;
  description: string;
  category: string;
  parameters: string[];
  example: string;
}

interface ChatSession {
  id: string;
  name: string;
  messages: ChatMessage[];
  created: string;
  lastActive: string;
  apiKey?: string;
}

export default function RemoteControlChat() {
  const [currentMessage, setCurrentMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [showApiDialog, setShowApiDialog] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showCommands, setShowCommands] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch chat sessions
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['/api/chat-sessions'],
    queryFn: async () => {
      const response = await fetch('/api/chat-sessions');
      if (!response.ok) throw new Error('Failed to fetch sessions');
      return response.json() as Promise<ChatSession[]>;
    }
  });

  // Fetch messages for current session
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/chat-sessions', selectedSession, 'messages'],
    queryFn: async () => {
      if (!selectedSession) return [];
      const response = await fetch(`/api/chat-sessions/${selectedSession}/messages`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json() as Promise<ChatMessage[]>;
    },
    enabled: !!selectedSession
  });

  // Fetch available commands
  const { data: commands = [], isLoading: commandsLoading } = useQuery({
    queryKey: ['/api/remote-commands'],
    queryFn: async () => {
      const response = await fetch('/api/remote-commands');
      if (!response.ok) throw new Error('Failed to fetch commands');
      return response.json() as Promise<RemoteCommand[]>;
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ sessionId, message }: { sessionId: string, message: string }) => {
      const response = await fetch(`/api/chat-sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat-sessions', selectedSession, 'messages'] });
      setCurrentMessage("");
      setIsProcessing(false);
    },
    onError: () => {
      setIsProcessing(false);
    }
  });

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch('/api/chat-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, apiKey })
      });
      if (!response.ok) throw new Error('Failed to create session');
      return response.json();
    },
    onSuccess: (newSession) => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat-sessions'] });
      setSelectedSession(newSession.id);
    }
  });

  // Execute remote command mutation
  const executeCommandMutation = useMutation({
    mutationFn: async ({ command, parameters }: { command: string, parameters: any }) => {
      const response = await fetch('/api/remote-execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, parameters })
      });
      if (!response.ok) throw new Error('Failed to execute command');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat-sessions', selectedSession, 'messages'] });
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (sessions.length > 0 && !selectedSession) {
      setSelectedSession(sessions[0].id);
    }
  }, [sessions, selectedSession]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !selectedSession || isProcessing) return;

    setIsProcessing(true);
    await sendMessageMutation.mutateAsync({
      sessionId: selectedSession,
      message: currentMessage
    });
  };

  const handleExecuteCommand = async (command: string, parameters: any = {}) => {
    await executeCommandMutation.mutateAsync({ command, parameters });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const currentSession = sessions.find(s => s.id === selectedSession);
  const commandCategories = Array.from(new Set(commands.map(c => c.category)));

  const getMessageIcon = (role: string, status: string) => {
    if (role === 'user') return <User className="w-4 h-4" />;
    if (role === 'system') return <Terminal className="w-4 h-4" />;
    if (status === 'processing') return <RefreshCw className="w-4 h-4 animate-spin" />;
    if (status === 'error') return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (status === 'success') return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <Bot className="w-4 h-4" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'processing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Remote Control Chat</h2>
          <p className="text-muted-foreground">
            Control all platform features via ChatGPT or natural language commands
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowCommands(!showCommands)}
          >
            <Code className="w-4 h-4 mr-2" />
            Commands
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowApiDialog(true)}
          >
            <Key className="w-4 h-4 mr-2" />
            API Key
          </Button>
          <Button
            onClick={() => createSessionMutation.mutate('New Chat Session')}
            disabled={createSessionMutation.isPending}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            New Session
          </Button>
        </div>
      </div>

      {/* Main Interface */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[calc(100vh-200px)] remote-control-horizontal">
        {/* Sessions Sidebar */}
        <div className="col-span-1 md:col-span-3 space-y-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Chat Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-full">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => setSelectedSession(session.id)}
                    className={`p-4 cursor-pointer border-b hover:bg-muted/50 transition-colors ${
                      selectedSession === session.id ? 'bg-muted border-l-4 border-primary' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium truncate">{session.name}</h4>
                      <Badge variant="secondary" className="ml-2">
                        {session.messages?.length || 0}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(session.lastActive).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="col-span-1 md:col-span-6 space-y-4">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    {currentSession?.name || 'Select Session'}
                  </CardTitle>
                  <CardDescription>
                    Send natural language commands to control the platform
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/chat-sessions'] })}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="flex gap-3">
                      <div className="mt-1">
                        {getMessageIcon(message.role, message.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium capitalize">{message.role}</span>
                          <Badge className={getStatusColor(message.status)} variant="secondary">
                            {message.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-3">
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          {message.command && (
                            <div className="mt-2 p-2 bg-code rounded text-xs font-mono">
                              Command: {message.command}
                            </div>
                          )}
                          {message.result && (
                            <div className="mt-2 p-2 bg-code rounded text-xs">
                              <pre className="whitespace-pre-wrap">
                                {JSON.stringify(message.result, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isProcessing && (
                    <div className="flex gap-3">
                      <div className="mt-1">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-muted/30 rounded-lg p-3">
                          <p className="text-sm">Processing your request...</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="mt-4 flex gap-2">
                <Textarea
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your command or question..."
                  className="flex-1 resize-none"
                  rows={2}
                  disabled={!selectedSession || isProcessing}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim() || !selectedSession || isProcessing}
                  size="lg"
                  className="px-4"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Commands Reference */}
        <div className="col-span-1 md:col-span-3 space-y-4">
          {showCommands && (
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="w-5 h-5" />
                  Available Commands
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-full">
                  {commandCategories.map((category) => (
                    <div key={category} className="p-4 border-b">
                      <h4 className="font-medium mb-2 capitalize">{category}</h4>
                      {commands
                        .filter(c => c.category === category)
                        .map((command) => (
                          <div
                            key={command.id}
                            className="mb-3 p-2 bg-muted/30 rounded cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => setCurrentMessage(command.example)}
                          >
                            <div className="font-mono text-sm mb-1">{command.command}</div>
                            <p className="text-xs text-muted-foreground mb-1">
                              {command.description}
                            </p>
                            <div className="text-xs text-primary font-mono">
                              {command.example}
                            </div>
                          </div>
                        ))}
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          {!showCommands && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setCurrentMessage("Show platform status")}
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Platform Status
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setCurrentMessage("Create new website")}
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Create Website
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setCurrentMessage("Upload APK file")}
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  Upload APK
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setCurrentMessage("Generate AI content")}
                >
                  <Bot className="w-4 h-4 mr-2" />
                  AI Content
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setCurrentMessage("Deploy to production")}
                >
                  <Cloud className="w-4 h-4 mr-2" />
                  Deploy
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* API Key Dialog */}
      <Dialog open={showApiDialog} onOpenChange={setShowApiDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure API Key</DialogTitle>
            <DialogDescription>
              Enter your ChatGPT API key to enable remote control functionality
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="apiKey">OpenAI API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowApiDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowApiDialog(false)}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}