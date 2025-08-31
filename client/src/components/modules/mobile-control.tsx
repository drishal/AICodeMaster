import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Smartphone, Play, Settings, Wifi, Camera, MessageSquare, Heart, Share, UserPlus } from "lucide-react";

interface MobileControlResult {
  success: boolean;
  action: string;
  app: string;
  result?: any;
  error?: string;
  executionTime?: number;
  screenshotPath?: string;
}

export function MobileControl() {
  const [selectedApp, setSelectedApp] = useState('');
  const [selectedAction, setSelectedAction] = useState<'like' | 'comment' | 'reply' | 'follow' | 'share' | 'scroll' | 'tap' | 'swipe'>('like');
  const [target, setTarget] = useState('');
  const [text, setText] = useState('');
  const [coordinates, setCoordinates] = useState({ x: 500, y: 1000 });
  const [delay, setDelay] = useState(1000);
  const [humanBehavior, setHumanBehavior] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<MobileControlResult | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch supported apps
  const { data: appsData, isLoading: appsLoading } = useQuery({
    queryKey: ['/api/mobile-control/supported-apps'],
    queryFn: () => apiRequest('/api/mobile-control/supported-apps')
  });

  // Fetch ADB connection status
  const { data: adbStatus, refetch: refetchAdbStatus } = useQuery({
    queryKey: ['/api/mobile-control/adb-status'],
    queryFn: () => apiRequest('/api/mobile-control/adb-status'),
    refetchInterval: 5000
  });

  // Fetch app configuration
  const { data: appConfigData } = useQuery({
    queryKey: ['/api/mobile-control/app-config', selectedApp],
    queryFn: () => apiRequest(`/api/mobile-control/app-config/${selectedApp}`),
    enabled: !!selectedApp
  });

  const apps = appsData?.apps || [];
  const appConfig = appConfigData?.config;

  // Mobile control execution mutation
  const executeMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/mobile-control/execute', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    }),
    onSuccess: (data) => {
      setResult(data);
      setIsExecuting(false);
      
      if (data.success) {
        toast({
          title: "Command Executed Successfully",
          description: `${data.action} action completed on ${data.app} in ${data.executionTime}ms`
        });
      } else {
        toast({
          title: "Command Failed",
          description: data.error,
          variant: "destructive"
        });
      }
    },
    onError: (error: any) => {
      setIsExecuting(false);
      toast({
        title: "Execution Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleExecuteCommand = async () => {
    if (!selectedApp || !selectedAction) {
      toast({
        title: "Missing Information",
        description: "Please select an app and action",
        variant: "destructive"
      });
      return;
    }

    if (!adbStatus?.connected) {
      toast({
        title: "ADB Not Connected",
        description: "Please connect your Android device via ADB",
        variant: "destructive"
      });
      return;
    }

    setIsExecuting(true);
    setResult(null);

    const commandData: any = {
      app: selectedApp,
      action: selectedAction,
      delay,
      humanBehavior
    };

    if (target) commandData.target = target;
    if (text && (selectedAction === 'comment' || selectedAction === 'reply')) {
      commandData.text = text;
    }
    if (selectedAction === 'tap' || selectedAction === 'swipe' || selectedAction === 'scroll') {
      commandData.coordinates = coordinates;
    }

    executeMutation.mutate(commandData);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'like': return <Heart className="w-4 h-4" />;
      case 'comment': return <MessageSquare className="w-4 h-4" />;
      case 'reply': return <MessageSquare className="w-4 h-4" />;
      case 'follow': return <UserPlus className="w-4 h-4" />;
      case 'share': return <Share className="w-4 h-4" />;
      case 'scroll': return <Play className="w-4 h-4 rotate-90" />;
      case 'tap': return <Play className="w-4 h-4" />;
      case 'swipe': return <Play className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getAppIcon = (app: string) => {
    return <Smartphone className="w-4 h-4" />;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">📱 Mobile Control</h1>
        <p className="text-muted-foreground">Automate mobile app interactions with intelligent control</p>
      </div>

      <Tabs defaultValue="control" className="w-full mobile-control-tabs">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="control">Control Panel</TabsTrigger>
          <TabsTrigger value="apps">App Config</TabsTrigger>
          <TabsTrigger value="connection">Connection</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="control" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Command Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Command Configuration
                </CardTitle>
                <CardDescription>Set up mobile automation commands</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="app">Target App</Label>
                  <Select value={selectedApp} onValueChange={setSelectedApp}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an app" />
                    </SelectTrigger>
                    <SelectContent>
                      {apps.map((app: string) => (
                        <SelectItem key={app} value={app}>
                          <div className="flex items-center gap-2">
                            {getAppIcon(app)}
                            <span className="capitalize">{app}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="action">Action</Label>
                  <Select value={selectedAction} onValueChange={(value: any) => setSelectedAction(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="like">
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4" />
                          Like
                        </div>
                      </SelectItem>
                      <SelectItem value="comment">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Comment
                        </div>
                      </SelectItem>
                      <SelectItem value="reply">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Reply
                        </div>
                      </SelectItem>
                      <SelectItem value="follow">
                        <div className="flex items-center gap-2">
                          <UserPlus className="w-4 h-4" />
                          Follow
                        </div>
                      </SelectItem>
                      <SelectItem value="share">
                        <div className="flex items-center gap-2">
                          <Share className="w-4 h-4" />
                          Share
                        </div>
                      </SelectItem>
                      <SelectItem value="scroll">
                        <div className="flex items-center gap-2">
                          <Play className="w-4 h-4 rotate-90" />
                          Scroll
                        </div>
                      </SelectItem>
                      <SelectItem value="tap">
                        <div className="flex items-center gap-2">
                          <Play className="w-4 h-4" />
                          Tap
                        </div>
                      </SelectItem>
                      <SelectItem value="swipe">
                        <div className="flex items-center gap-2">
                          <Play className="w-4 h-4" />
                          Swipe
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(selectedAction === 'follow' || selectedAction === 'reply') && (
                  <div>
                    <Label htmlFor="target">Target User/Post</Label>
                    <Input
                      id="target"
                      placeholder="@username or post identifier"
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                    />
                  </div>
                )}

                {(selectedAction === 'comment' || selectedAction === 'reply') && (
                  <div>
                    <Label htmlFor="text">Message Text</Label>
                    <Textarea
                      id="text"
                      placeholder="Enter your comment or reply text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      rows={3}
                    />
                  </div>
                )}

                {(selectedAction === 'tap' || selectedAction === 'swipe' || selectedAction === 'scroll') && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="x">X Coordinate</Label>
                      <Input
                        id="x"
                        type="number"
                        value={coordinates.x}
                        onChange={(e) => setCoordinates({...coordinates, x: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="y">Y Coordinate</Label>
                      <Input
                        id="y"
                        type="number"
                        value={coordinates.y}
                        onChange={(e) => setCoordinates({...coordinates, y: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="delay">Delay (ms)</Label>
                  <Input
                    id="delay"
                    type="number"
                    min="100"
                    value={delay}
                    onChange={(e) => setDelay(parseInt(e.target.value) || 1000)}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="humanBehavior"
                    checked={humanBehavior}
                    onCheckedChange={setHumanBehavior}
                  />
                  <Label htmlFor="humanBehavior">Human-like behavior</Label>
                </div>
              </CardContent>
            </Card>

            {/* Execution Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Execution Status
                </CardTitle>
                <CardDescription>Monitor command execution and results</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant={adbStatus?.connected ? "default" : "destructive"}>
                    {adbStatus?.connected ? "Connected" : "Disconnected"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {adbStatus?.devices?.length || 0} device(s)
                  </span>
                </div>

                {adbStatus?.devices && adbStatus.devices.length > 0 && (
                  <div className="space-y-2">
                    <Label>Connected Devices:</Label>
                    {adbStatus.devices.map((device: string) => (
                      <div key={device} className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        <span className="text-sm font-mono">{device}</span>
                      </div>
                    ))}
                  </div>
                )}

                {result && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {result.success ? (
                        <Badge variant="default">Success</Badge>
                      ) : (
                        <Badge variant="destructive">Failed</Badge>
                      )}
                      {result.executionTime && (
                        <span className="text-sm text-muted-foreground">
                          {result.executionTime}ms
                        </span>
                      )}
                    </div>
                    
                    {result.success && (
                      <div className="p-3 bg-muted rounded-lg space-y-1">
                        <p className="text-sm"><strong>Action:</strong> {result.action}</p>
                        <p className="text-sm"><strong>App:</strong> {result.app}</p>
                        {result.screenshotPath && (
                          <Button size="sm" onClick={() => window.open(result.screenshotPath, '_blank')}>
                            <Camera className="w-4 h-4 mr-2" />
                            View Screenshot
                          </Button>
                        )}
                      </div>
                    )}

                    {result.error && (
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <p className="text-sm text-destructive">{result.error}</p>
                      </div>
                    )}
                  </div>
                )}

                <Button 
                  onClick={handleExecuteCommand}
                  disabled={isExecuting || !adbStatus?.connected || !selectedApp}
                  className="w-full"
                >
                  {isExecuting ? 'Executing...' : 'Execute Command'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="apps" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Supported Apps</CardTitle>
              <CardDescription>View supported applications and their configurations</CardDescription>
            </CardHeader>
            <CardContent>
              {appsLoading ? (
                <div className="text-center py-8">Loading apps...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {apps.map((app: string) => (
                    <Card 
                      key={app} 
                      className={`cursor-pointer transition-all hover:shadow-md ${selectedApp === app ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => setSelectedApp(app)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          {getAppIcon(app)}
                          <h3 className="font-semibold capitalize">{app}</h3>
                        </div>
                        
                        {selectedApp === app && appConfig && (
                          <div className="mt-3 space-y-2 text-sm">
                            <p><strong>Package:</strong> {appConfig.packageName}</p>
                            <p><strong>Activity:</strong> {appConfig.activityName}</p>
                            <div>
                              <strong>Actions:</strong>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {Object.keys(appConfig.selectors).map(selector => (
                                  <Badge key={selector} variant="outline" className="text-xs">
                                    {selector.replace('Button', '').replace('Input', '')}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connection" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="w-5 h-5" />
                ADB Connection
              </CardTitle>
              <CardDescription>Manage Android Debug Bridge connection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={adbStatus?.connected ? "default" : "destructive"}>
                    {adbStatus?.connected ? "Connected" : "Disconnected"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {adbStatus?.devices?.length || 0} device(s) found
                  </span>
                </div>
                <Button size="sm" onClick={() => refetchAdbStatus()}>
                  Refresh
                </Button>
              </div>

              {adbStatus?.devices && adbStatus.devices.length > 0 ? (
                <div className="space-y-2">
                  <Label>Connected Devices:</Label>
                  <div className="space-y-2">
                    {adbStatus.devices.map((device: string) => (
                      <div key={device} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4" />
                          <span className="font-mono text-sm">{device}</span>
                        </div>
                        <Badge variant="default">Ready</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">No devices connected</h3>
                    <p className="text-sm text-muted-foreground">
                      Connect your Android device via ADB to start automation
                    </p>
                  </div>
                  
                  <div className="text-left space-y-2 text-sm bg-muted p-4 rounded-lg">
                    <p><strong>Setup Instructions:</strong></p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Enable Developer Options on your Android device</li>
                      <li>Enable USB Debugging in Developer Options</li>
                      <li>Connect device via USB cable</li>
                      <li>Accept USB debugging authorization on device</li>
                      <li>Run: <code className="bg-background px-1 rounded">adb devices</code></li>
                    </ol>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Execution Results</CardTitle>
              <CardDescription>View command execution history and results</CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Latest Execution:</span>
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.success ? "Success" : "Failed"}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Action</Label>
                      <p className="text-sm capitalize">{result.action}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">App</Label>
                      <p className="text-sm capitalize">{result.app}</p>
                    </div>
                    {result.executionTime && (
                      <>
                        <div>
                          <Label className="text-sm font-medium">Execution Time</Label>
                          <p className="text-sm">{result.executionTime}ms</p>
                        </div>
                      </>
                    )}
                  </div>

                  {result.screenshotPath && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Screenshot</Label>
                      <Button 
                        size="sm" 
                        onClick={() => window.open(result.screenshotPath, '_blank')}
                        className="w-full"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        View Screenshot
                      </Button>
                    </div>
                  )}

                  {result.error && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Error Details</Label>
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <p className="text-sm text-destructive">{result.error}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No execution results yet. Run a command to see results here.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}