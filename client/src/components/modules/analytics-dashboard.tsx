import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Zap, 
  Target, 
  Clock, 
  DollarSign,
  Download,
  RefreshCw,
  Activity,
  Globe,
  Cpu,
  HardDrive,
  Wifi,
  Video,
  MessageSquare,
  FileText,
  Bot,
  Sparkles,
  Eye,
  Calendar,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeProfiles: number;
    activeCampaigns: number;
    documentsStored: number;
    commandsExecuted: number;
    scheduledTasks: number;
    conversationsHeld: number;
    automationTasksActive: number;
  };
  performance: {
    avgResponseTime: number;
    successRate: number;
    uptime: number;
    errorRate: number;
  };
  usage: {
    topModules: Array<{
      module: string;
      usage: number;
      growth: number;
    }>;
    userActivity: Array<{
      date: string;
      activeUsers: number;
      commands: number;
      content: number;
    }>;
    platformDistribution: Array<{
      platform: string;
      percentage: number;
      posts: number;
    }>;
  };
  content: {
    totalContent: number;
    reelsGenerated: number;
    emailsCrafted: number;
    seoKeywords: number;
    contentRecommendations: number;
  };
  automation: {
    tasksCompleted: number;
    timesSaved: number;
    roiGenerated: number;
    leadsCaptured: number;
  };
  trends: {
    weeklyGrowth: number;
    monthlyGrowth: number;
    mostUsedFeatures: string[];
    peakUsageHours: string[];
  };
}

interface RealtimeStats {
  timestamp: string;
  activeUsers: number;
  ongoingTasks: number;
  systemLoad: number;
  memoryUsage: number;
  cpuUsage: number;
}

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [realtimeStats, setRealtimeStats] = useState<RealtimeStats | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch analytics data
  const { data: analyticsData, isLoading: analyticsLoading, refetch: refetchAnalytics } = useQuery({
    queryKey: ['/api/analytics'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch realtime stats
  const { data: realtime } = useQuery({
    queryKey: ['/api/analytics/realtime'],
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  useEffect(() => {
    if (realtime && typeof realtime === 'object') {
      setRealtimeStats(realtime as RealtimeStats);
    }
  }, [realtime]);

  const handleExportData = async (format: 'json' | 'csv') => {
    try {
      const response = await apiRequest(`/api/analytics/export?format=${format}`, {
        method: 'GET'
      });
      
      const blob = new Blob([response], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({ title: `Analytics exported as ${format.toUpperCase()}` });
    } catch (error: any) {
      toast({ title: "Export failed", description: error.message, variant: "destructive" });
    }
  };

  const handleRefreshData = () => {
    refetchAnalytics();
    queryClient.invalidateQueries({ queryKey: ['/api/analytics/realtime'] });
    toast({ title: "Analytics data refreshed" });
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <ArrowUp className="w-3 h-3 text-green-500" />
    ) : (
      <ArrowDown className="w-3 h-3 text-red-500" />
    );
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? "text-green-600" : "text-red-600";
  };

  if (analyticsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6 animate-pulse" />
          <span>Loading analytics data...</span>
        </div>
      </div>
    );
  }

  const data: AnalyticsData = (analyticsData as AnalyticsData) || {
    overview: { totalUsers: 0, activeProfiles: 0, activeCampaigns: 0, documentsStored: 0, commandsExecuted: 0, scheduledTasks: 0, conversationsHeld: 0, automationTasksActive: 0 },
    performance: { avgResponseTime: 0, successRate: 0, uptime: 0, errorRate: 0 },
    usage: { topModules: [], userActivity: [], platformDistribution: [] },
    content: { totalContent: 0, reelsGenerated: 0, emailsCrafted: 0, seoKeywords: 0, contentRecommendations: 0 },
    automation: { tasksCompleted: 0, timesSaved: 0, roiGenerated: 0, leadsCaptured: 0 },
    trends: { weeklyGrowth: 0, monthlyGrowth: 0, mostUsedFeatures: [], peakUsageHours: [] }
  };

  return (
    <Card className="bg-surface border-surface-variant w-full max-w-full overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <span className="text-base sm:text-lg">Analytics Dashboard Pro</span>
          </div>
          <div className="flex gap-1 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleRefreshData} className="text-xs">
              <RefreshCw className="w-3 h-3 mr-1" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExportData('csv')} className="text-xs">
              <Download className="w-3 h-3 mr-1" />
              CSV
            </Button>
          </div>
        </CardTitle>
        <div className="card-description">
          Advanced analytics with real-time monitoring, predictive insights, custom reports, 
          ROI tracking, user behavior analysis, and automated performance optimization.
        </div>
        <div className="feature-list">
          <div className="feature-tag">Real Time Monitor</div>
          <div className="feature-tag">Predictive Insights</div>
          <div className="feature-tag">Custom Reports</div>
          <div className="feature-tag">ROI Tracking</div>
          <div className="feature-tag">Behavior Analysis</div>
          <div className="feature-tag">Auto Optimize</div>
          <div className="feature-tag">Multi Platform</div>
          <div className="feature-tag">Export Data</div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[400px] sm:max-h-[550px] overflow-y-auto scrollbar-hide">
        <div className="space-y-4">
          {/* Main content */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Analytics Dashboard</h3>
              <p className="text-muted-foreground">
                Comprehensive insights across all 37+ platform modules
              </p>
            </div>
          </div>

      {/* Real-time Stats Bar */}
      {realtimeStats && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                  <div className="font-semibold">{realtimeStats.activeUsers}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-500" />
                <div>
                  <div className="text-sm text-muted-foreground">Ongoing Tasks</div>
                  <div className="font-semibold">{realtimeStats.ongoingTasks}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-orange-500" />
                <div>
                  <div className="text-sm text-muted-foreground">CPU Usage</div>
                  <div className="font-semibold">{realtimeStats.cpuUsage}%</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-purple-500" />
                <div>
                  <div className="text-sm text-muted-foreground">Memory</div>
                  <div className="font-semibold">{realtimeStats.memoryUsage}%</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-teal-500" />
                <div>
                  <div className="text-sm text-muted-foreground">System Load</div>
                  <div className="font-semibold">{realtimeStats.systemLoad}%</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{formatNumber(data.overview.totalUsers)}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Profiles</p>
                    <p className="text-2xl font-bold">{formatNumber(data.overview.activeProfiles)}</p>
                  </div>
                  <Globe className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Commands Executed</p>
                    <p className="text-2xl font-bold">{formatNumber(data.overview.commandsExecuted)}</p>
                  </div>
                  <Zap className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Documents Stored</p>
                    <p className="text-2xl font-bold">{formatNumber(data.overview.documentsStored)}</p>
                  </div>
                  <FileText className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Campaigns</p>
                    <p className="text-2xl font-bold">{formatNumber(data.overview.activeCampaigns)}</p>
                  </div>
                  <Target className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Scheduled Tasks</p>
                    <p className="text-2xl font-bold">{formatNumber(data.overview.scheduledTasks)}</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Conversations</p>
                    <p className="text-2xl font-bold">{formatNumber(data.overview.conversationsHeld)}</p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-cyan-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Automation Tasks</p>
                    <p className="text-2xl font-bold">{formatNumber(data.overview.automationTasksActive)}</p>
                  </div>
                  <Bot className="w-8 h-8 text-indigo-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Response Time</p>
                    <Clock className="w-4 h-4" />
                  </div>
                  <p className="text-2xl font-bold">{data.performance.avgResponseTime}ms</p>
                  <p className="text-xs text-green-600">Excellent</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <p className="text-2xl font-bold">{data.performance.successRate}%</p>
                  <Progress value={data.performance.successRate} className="w-full" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Uptime</p>
                    <Activity className="w-4 h-4" />
                  </div>
                  <p className="text-2xl font-bold">{data.performance.uptime}%</p>
                  <Progress value={data.performance.uptime} className="w-full" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Error Rate</p>
                    <Zap className="w-4 h-4" />
                  </div>
                  <p className="text-2xl font-bold">{data.performance.errorRate}%</p>
                  <p className="text-xs text-green-600">Low</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Modules */}
            <Card>
              <CardHeader>
                <CardTitle>Top Modules by Usage</CardTitle>
                <CardDescription>Most active modules in the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {data.usage.topModules.map((module, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium">{module.module}</p>
                          <p className="text-sm text-muted-foreground">{formatNumber(module.usage)} uses</p>
                        </div>
                        <div className={`flex items-center gap-1 ${getGrowthColor(module.growth)}`}>
                          {getGrowthIcon(module.growth)}
                          <span className="text-sm font-medium">{module.growth}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Platform Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Distribution</CardTitle>
                <CardDescription>Content distribution across platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.usage.platformDistribution.map((platform, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{platform.platform}</span>
                        <span className="text-sm text-muted-foreground">{platform.percentage}%</span>
                      </div>
                      <Progress value={platform.percentage} className="w-full" />
                      <p className="text-xs text-muted-foreground">{formatNumber(platform.posts)} posts</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Content</p>
                    <p className="text-2xl font-bold">{formatNumber(data.content.totalContent)}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Reels Generated</p>
                    <p className="text-2xl font-bold">{formatNumber(data.content.reelsGenerated)}</p>
                  </div>
                  <Video className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Emails Crafted</p>
                    <p className="text-2xl font-bold">{formatNumber(data.content.emailsCrafted)}</p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">SEO Keywords</p>
                    <p className="text-2xl font-bold">{formatNumber(data.content.seoKeywords)}</p>
                  </div>
                  <Target className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tasks Completed</p>
                    <p className="text-2xl font-bold">{formatNumber(data.automation.tasksCompleted)}</p>
                  </div>
                  <Bot className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Time Saved</p>
                    <p className="text-2xl font-bold">{formatNumber(data.automation.timesSaved)}h</p>
                  </div>
                  <Clock className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">ROI Generated</p>
                    <p className="text-2xl font-bold">${formatNumber(data.automation.roiGenerated)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Leads Captured</p>
                    <p className="text-2xl font-bold">{formatNumber(data.automation.leadsCaptured)}</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Growth Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Growth Metrics</CardTitle>
                <CardDescription>Platform growth over time</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">Weekly Growth</p>
                    <p className="text-sm text-muted-foreground">Last 7 days</p>
                  </div>
                  <div className={`flex items-center gap-1 ${getGrowthColor(data.trends.weeklyGrowth)}`}>
                    {getGrowthIcon(data.trends.weeklyGrowth)}
                    <span className="text-lg font-bold">{data.trends.weeklyGrowth}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">Monthly Growth</p>
                    <p className="text-sm text-muted-foreground">Last 30 days</p>
                  </div>
                  <div className={`flex items-center gap-1 ${getGrowthColor(data.trends.monthlyGrowth)}`}>
                    {getGrowthIcon(data.trends.monthlyGrowth)}
                    <span className="text-lg font-bold">{data.trends.monthlyGrowth}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Most Used Features */}
            <Card>
              <CardHeader>
                <CardTitle>Most Used Features</CardTitle>
                <CardDescription>Top features by engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.trends.mostUsedFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                        <span className="text-sm font-bold text-primary">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{feature}</p>
                        <Badge variant="secondary" className="text-xs">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Popular
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Peak Usage Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Peak Usage Hours</CardTitle>
              <CardDescription>Times when the platform is most active</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {data.trends.peakUsageHours.map((hour, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 rounded-lg border">
                    <Calendar className="w-4 h-4 text-primary" />
                    <div>
                      <p className="font-medium">{hour}</p>
                      <p className="text-xs text-muted-foreground">Peak time</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}