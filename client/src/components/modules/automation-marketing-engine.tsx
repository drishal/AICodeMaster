import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Zap, 
  Heart, 
  FileText, 
  Target, 
  UserPlus, 
  Mail, 
  MessageCircle, 
  Users, 
  Download,
  Copy,
  Sparkles,
  TrendingUp,
  PenTool,
  Send,
  Bot,
  BarChart3
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CommandResult {
  success: boolean;
  data: any;
  command: string;
  timestamp: string;
}

export default function AutomationMarketingEngine() {
  const [activeCommand, setActiveCommand] = useState("");
  const [commandInput, setCommandInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<CommandResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Quick command presets
  const quickCommands = [
    { 
      id: 'seo', 
      label: 'SEO Keywords', 
      icon: Search, 
      placeholder: '/seo mobile app development',
      description: 'Generate comprehensive SEO keyword research'
    },
    { 
      id: 'emotion', 
      label: 'Emotion Detection', 
      icon: Heart, 
      placeholder: '/emotion "I love this product but the price is too high"',
      description: 'Analyze emotional tone and sentiment'
    },
    { 
      id: 'content', 
      label: 'Content Pack', 
      icon: FileText, 
      placeholder: '/content digital marketing',
      description: 'Generate 3-piece content pack for any niche'
    },
    { 
      id: 'strategy', 
      label: 'Marketing Strategy', 
      icon: Target, 
      placeholder: '/strategy ROAS-focused',
      description: 'Create comprehensive marketing strategy'
    },
    { 
      id: 'capture', 
      label: 'Lead Capture', 
      icon: UserPlus, 
      placeholder: '/capture "John Doe" john@email.com +1234567890 business mobile-dev',
      description: 'Capture and save lead information'
    },
    { 
      id: 'email', 
      label: 'Email Copy', 
      icon: Mail, 
      placeholder: '/email "Sarah Johnson"',
      description: 'Generate personalized marketing email'
    },
    { 
      id: 'whatsapp', 
      label: 'WhatsApp Copy', 
      icon: MessageCircle, 
      placeholder: '/whatsapp "Mike Chen"',
      description: 'Create engaging WhatsApp sales messages'
    },
    { 
      id: 'crm', 
      label: 'CRM Functions', 
      icon: Users, 
      placeholder: '/list_contacts or /export_csv',
      description: 'Access lead CRM functionality'
    }
  ];

  // Process automation command
  const processCommandMutation = useMutation({
    mutationFn: async (command: string) => {
      setIsProcessing(true);
      const response = await apiRequest('/api/automation/command', {
        method: 'POST',
        body: JSON.stringify({ command })
      });
      return response;
    },
    onSuccess: (data, command) => {
      const result: CommandResult = {
        success: true,
        data,
        command,
        timestamp: new Date().toISOString()
      };
      setCommandHistory(prev => [result, ...prev]);
      setCommandInput("");
      setIsProcessing(false);
      toast({ title: "Command executed successfully" });
    },
    onError: (error: any) => {
      const result: CommandResult = {
        success: false,
        data: { error: error.message },
        command: commandInput,
        timestamp: new Date().toISOString()
      };
      setCommandHistory(prev => [result, ...prev]);
      setIsProcessing(false);
      toast({ title: "Command failed", description: error.message, variant: "destructive" });
    }
  });

  const handleExecuteCommand = () => {
    if (!commandInput.trim()) return;
    processCommandMutation.mutate(commandInput);
  };

  const handleQuickCommand = (command: any) => {
    setCommandInput(command.placeholder);
    setActiveCommand(command.id);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const renderResult = (result: CommandResult) => {
    if (!result.success) {
      return (
        <div className="p-4 border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
            <span className="text-sm font-medium">Error</span>
            <Badge variant="destructive" className="text-xs">Failed</Badge>
          </div>
          <p className="text-sm text-red-700 dark:text-red-300">{result.data.error}</p>
        </div>
      );
    }

    const { data } = result;

    // SEO Keywords Result
    if (result.command.startsWith('/seo')) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold">SEO Keyword Research</h3>
            <Badge variant="secondary">Keywords Generated</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Primary Keywords</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {data.primary_keywords?.map((keyword: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="cursor-pointer" 
                           onClick={() => copyToClipboard(keyword)}>
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Long-tail Keywords</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {data.long_tail_keywords?.map((keyword: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="cursor-pointer"
                           onClick={() => copyToClipboard(keyword)}>
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {data.content_suggestions && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Content Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {data.content_suggestions.map((suggestion: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <PenTool className="w-3 h-3 mt-1 text-green-600" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      );
    }

    // Emotion Detection Result
    if (result.command.startsWith('/emotion')) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-600" />
            <h3 className="font-semibold">Emotion Analysis</h3>
            <Badge variant="secondary">Analysis Complete</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{data.primary_emotion}</div>
                  <div className="text-sm text-muted-foreground">Primary Emotion</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{data.sentiment}</div>
                  <div className="text-sm text-muted-foreground">Sentiment</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round((data.confidence_score || 0) * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Confidence</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {data.recommended_response_tone && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Recommended Response Tone</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  {data.recommended_response_tone}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      );
    }

    // Content Pack Result
    if (result.command.startsWith('/content')) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-orange-600" />
            <h3 className="font-semibold">Content Pack Generated</h3>
            <Badge variant="secondary">{data.posts?.length || 0} Posts</Badge>
          </div>

          <div className="space-y-4">
            {data.posts?.map((post: any, idx: number) => (
              <Card key={idx}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{post.title}</CardTitle>
                    <Badge variant="outline">{post.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {post.hashtags?.map((tag: string, tagIdx: number) => (
                        <Badge key={tagIdx} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(post.content)}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  
                  {post.call_to_action && (
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded border-l-4 border-green-500">
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">
                        CTA: {post.call_to_action}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    // Strategy Result
    if (result.command.startsWith('/strategy')) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-red-600" />
            <h3 className="font-semibold">Marketing Strategy</h3>
            <Badge variant="secondary">{data.strategy_type}</Badge>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Strategy Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium text-sm mb-2">Objective</h4>
                <p className="text-sm text-muted-foreground">{data.objective}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-2">Timeline</h4>
                <Badge variant="outline">{data.timeline}</Badge>
              </div>
            </CardContent>
          </Card>

          {data.tactics && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Implementation Tactics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.tactics.map((tactic: any, idx: number) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-sm">{tactic.tactic_name}</h5>
                        <Badge variant="secondary" className="text-xs">{tactic.budget_required}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{tactic.description}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-green-600">Expected: {tactic.expected_outcome}</span>
                        <span>•</span>
                        <span className="text-blue-600">Timeline: {tactic.timeframe}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      );
    }

    // Lead Capture Result
    if (result.command.startsWith('/capture')) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-green-600" />
            <h3 className="font-semibold">Lead Captured</h3>
            <Badge variant="secondary">Success</Badge>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Contact ID:</span>
                  <Badge variant="outline">#{data.contact_id}</Badge>
                </div>
                <p className="text-sm text-green-600">{data.message}</p>
              </div>
            </CardContent>
          </Card>

          {data.next_steps && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Recommended Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {data.next_steps.map((step: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                      {step}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      );
    }

    // Email/WhatsApp Copy Results
    if (result.command.startsWith('/email') || result.command.startsWith('/whatsapp')) {
      const isEmail = result.command.startsWith('/email');
      
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {isEmail ? <Mail className="w-4 h-4 text-blue-600" /> : <MessageCircle className="w-4 h-4 text-green-600" />}
            <h3 className="font-semibold">{isEmail ? 'Email Copy' : 'WhatsApp Copy'} Generated</h3>
            <Badge variant="secondary">Ready to Use</Badge>
          </div>

          {data.subject_lines && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Subject Line Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.subject_lines.map((subject: string, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{subject}</span>
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(subject)}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {data.message_variations && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Message Variations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.message_variations.map((msg: any, idx: number) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">{msg.type}</Badge>
                        <Button size="sm" variant="outline" onClick={() => copyToClipboard(msg.content)}>
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{isEmail ? 'Email Body' : 'Main Message'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{data.email_body || data.content}</p>
              </div>
              <div className="mt-3 flex justify-end">
                <Button 
                  size="sm" 
                  onClick={() => copyToClipboard(data.email_body || data.content)}
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy Full Text
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // CRM Results (list_contacts, export_csv)
    if (result.command === '/list_contacts') {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-600" />
            <h3 className="font-semibold">Contact List</h3>
            <Badge variant="secondary">{data.length} Contacts</Badge>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {data.map((contact: any, idx: number) => (
              <Card key={idx}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">
                        {contact.firstName} {contact.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {contact.email} • {contact.company}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{contact.status}</Badge>
                      <div className="text-xs text-muted-foreground">
                        Score: {contact.leadScore}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    // Default result display
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Automation & Marketing Engine</h2>
          <p className="text-muted-foreground">
            AI-powered marketing automation with SEO, content generation, and lead management
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Bot className="w-3 h-3" />
            AI-Powered
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Zero Budget
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="commands" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="commands">Quick Commands</TabsTrigger>
          <TabsTrigger value="console">Command Console</TabsTrigger>
          <TabsTrigger value="history">Command History</TabsTrigger>
        </TabsList>

        <TabsContent value="commands" className="space-y-6">
          {/* Quick Commands Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickCommands.map((command) => (
              <Card 
                key={command.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  activeCommand === command.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleQuickCommand(command)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <command.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{command.label}</h3>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {command.description}
                  </p>
                  <div className="text-xs font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
                    {command.placeholder}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="console" className="space-y-6">
          {/* Command Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Command Console
              </CardTitle>
              <CardDescription>
                Execute automation commands using natural language syntax
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter command (e.g., /seo mobile development)"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleExecuteCommand()}
                  className="font-mono"
                />
                <Button 
                  onClick={handleExecuteCommand}
                  disabled={!commandInput.trim() || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Processing
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Execute
                    </>
                  )}
                </Button>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Available Commands:</strong></p>
                <p>/seo [topic] • /emotion [text] • /content [niche] • /strategy [type]</p>
                <p>/capture [name] [email] [phone] [type] [interest] • /email [name] • /whatsapp [name]</p>
                <p>/list_contacts • /export_csv</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {/* Command History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Command History
              </CardTitle>
              <CardDescription>
                Recent automation command executions and results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {commandHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No commands executed yet. Try running a command from the console.
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {commandHistory.map((result, idx) => (
                      <div key={idx} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant={result.success ? "secondary" : "destructive"}>
                              {result.success ? "Success" : "Failed"}
                            </Badge>
                            <span className="font-mono text-sm">{result.command}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(result.timestamp).toLocaleString()}
                          </span>
                        </div>
                        
                        <Separator className="mb-3" />
                        
                        <div className="space-y-3">
                          {renderResult(result)}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}