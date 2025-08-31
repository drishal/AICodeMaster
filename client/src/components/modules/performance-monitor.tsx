import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Cpu, 
  HardDrive, 
  Activity, 
  Zap, 
  Database,
  Globe,
  AlertTriangle,
  CheckCircle,
  Info,
  TrendingUp,
  Gauge,
  Settings,
  RefreshCw,
  Play,
  Award,
  Target
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PerformanceMetrics {
  system: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkLatency: number;
    uptime: number;
  };
  database: {
    connectionCount: number;
    queryResponseTime: number;
    slowQueries: number;
    cacheHitRatio: number;
  };
  api: {
    requestsPerSecond: number;
    averageResponseTime: number;
    errorRate: number;
    throughput: number;
  };
  recommendations: Array<{
    type: 'critical' | 'warning' | 'info';
    category: 'performance' | 'security' | 'optimization';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
    action: string;
  }>;
}

interface OptimizationReport {
  score: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  improvements: Array<{
    area: string;
    current: number;
    target: number;
    improvement: string;
    priority: number;
  }>;
  estimatedGains: {
    speedIncrease: string;
    resourceSavings: string;
    costReduction: string;
  };
}

interface HealthStatus {
  status: 'healthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    cpu: 'pass' | 'fail';
    memory: 'pass' | 'fail';
    api: 'pass' | 'fail';
    database: 'pass' | 'fail';
  };
}

export default function PerformanceMonitor() {
  const [activeTab, setActiveTab] = useState("overview");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch performance metrics
  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useQuery({
    queryKey: ['/api/performance/metrics'],
    refetchInterval: autoRefresh ? 5000 : false
  });

  // Fetch optimization report
  const { data: optimizationReport, isLoading: reportLoading } = useQuery({
    queryKey: ['/api/performance/optimization-report'],
    refetchInterval: autoRefresh ? 30000 : false
  });

  // Fetch health status
  const { data: healthStatus } = useQuery({
    queryKey: ['/api/performance/health'],
    refetchInterval: autoRefresh ? 10000 : false
  });

  const handleAutoOptimize = async () => {
    try {
      const result = await apiRequest('/api/performance/auto-optimize', {
        method: 'POST'
      }) as any;
      
      toast({ 
        title: "Auto-optimization completed", 
        description: `Applied ${result.optimizationsApplied?.length || 0} optimizations` 
      });
      
      // Refresh all data
      queryClient.invalidateQueries({ queryKey: ['/api/performance'] });
    } catch (error: any) {
      toast({ 
        title: "Optimization failed", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
    toast({ 
      title: autoRefresh ? "Auto-refresh disabled" : "Auto-refresh enabled"
    });
  };

  const getUsageColor = (usage: number, thresholds = [50, 80]) => {
    if (usage >= thresholds[1]) return "text-red-600";
    if (usage >= thresholds[0]) return "text-yellow-600";
    return "text-green-600";
  };

  const getGradeColor = (grade: string) => {
    if (['A+', 'A'].includes(grade)) return "text-green-600";
    if (['B+', 'B'].includes(grade)) return "text-blue-600";
    if (['C+', 'C'].includes(grade)) return "text-yellow-600";
    return "text-red-600";
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info': return <Info className="w-4 h-4 text-blue-500" />;
      default: return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  if (metricsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 animate-pulse" />
          <span>Loading performance data...</span>
        </div>
      </div>
    );
  }

  const performanceData: PerformanceMetrics = (metrics as PerformanceMetrics) || {
    system: { cpuUsage: 0, memoryUsage: 0, diskUsage: 0, networkLatency: 0, uptime: 0 },
    database: { connectionCount: 0, queryResponseTime: 0, slowQueries: 0, cacheHitRatio: 0 },
    api: { requestsPerSecond: 0, averageResponseTime: 0, errorRate: 0, throughput: 0 },
    recommendations: []
  };

  const report: OptimizationReport = (optimizationReport as OptimizationReport) || {
    score: 0,
    grade: 'F' as const,
    improvements: [],
    estimatedGains: { speedIncrease: '0%', resourceSavings: '0%', costReduction: '$0' }
  };

  const health: HealthStatus = (healthStatus as HealthStatus) || {
    status: 'degraded' as const,
    timestamp: new Date().toISOString(),
    uptime: 0,
    version: '1.0.0',
    environment: 'development',
    checks: { cpu: 'fail', memory: 'fail', api: 'fail', database: 'fail' }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Performance Monitor</h2>
          <p className="text-muted-foreground">
            Real-time system performance and optimization insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleAutoRefresh}
            className={autoRefresh ? "bg-green-50" : ""}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleAutoOptimize}>
            <Play className="w-4 h-4 mr-2" />
            Auto Optimize
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetchMetrics()}>
            <Settings className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Health Status Bar */}
      <Alert className={health.status === 'healthy' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
        <div className="flex items-center gap-2">
          {health.status === 'healthy' ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600" />
          )}
          <AlertTitle className="mb-0">
            System Status: {health.status === 'healthy' ? 'Healthy' : 'Degraded'}
          </AlertTitle>
        </div>
        <AlertDescription className="mt-2">
          Uptime: {health.uptime.toFixed(2)} hours | Environment: {health.environment} | Version: {health.version}
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Performance Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Performance Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <span className={`text-4xl font-bold ${getGradeColor(report.grade)}`}>
                      {report.score}/100
                    </span>
                    <Badge variant="outline" className={`text-lg px-3 py-1 ${getGradeColor(report.grade)}`}>
                      Grade {report.grade}
                    </Badge>
                  </div>
                  <Progress value={report.score} className="w-64" />
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm text-muted-foreground">Estimated Gains</p>
                  <p className="font-semibold">Speed: {report.estimatedGains.speedIncrease}</p>
                  <p className="font-semibold">Savings: {report.estimatedGains.resourceSavings}</p>
                  <p className="font-semibold">Cost: {report.estimatedGains.costReduction}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">CPU Usage</p>
                    <p className={`text-2xl font-bold ${getUsageColor(performanceData.system.cpuUsage)}`}>
                      {performanceData.system.cpuUsage}%
                    </p>
                  </div>
                  <Cpu className="w-8 h-8 text-blue-500" />
                </div>
                <Progress value={performanceData.system.cpuUsage} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Memory</p>
                    <p className={`text-2xl font-bold ${getUsageColor(performanceData.system.memoryUsage)}`}>
                      {performanceData.system.memoryUsage}%
                    </p>
                  </div>
                  <HardDrive className="w-8 h-8 text-green-500" />
                </div>
                <Progress value={performanceData.system.memoryUsage} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Response Time</p>
                    <p className={`text-2xl font-bold ${getUsageColor(performanceData.api.averageResponseTime, [150, 300])}`}>
                      {performanceData.api.averageResponseTime}ms
                    </p>
                  </div>
                  <Zap className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Error Rate</p>
                    <p className={`text-2xl font-bold ${getUsageColor(performanceData.api.errorRate, [1, 3])}`}>
                      {performanceData.api.errorRate}%
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Health Checks */}
          <Card>
            <CardHeader>
              <CardTitle>System Health Checks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(health.checks).map(([check, status]) => (
                  <div key={check} className="flex items-center justify-between p-3 rounded-lg border">
                    <span className="capitalize font-medium">{check}</span>
                    <Badge variant={status === 'pass' ? 'default' : 'destructive'}>
                      {status === 'pass' ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 mr-1" />
                      )}
                      {status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>System Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>CPU Usage</span>
                    <span className={getUsageColor(performanceData.system.cpuUsage)}>
                      {performanceData.system.cpuUsage}%
                    </span>
                  </div>
                  <Progress value={performanceData.system.cpuUsage} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Memory Usage</span>
                    <span className={getUsageColor(performanceData.system.memoryUsage)}>
                      {performanceData.system.memoryUsage}%
                    </span>
                  </div>
                  <Progress value={performanceData.system.memoryUsage} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Disk Usage</span>
                    <span className={getUsageColor(performanceData.system.diskUsage)}>
                      {performanceData.system.diskUsage}%
                    </span>
                  </div>
                  <Progress value={performanceData.system.diskUsage} />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span>Network Latency</span>
                  <span className="font-medium">{performanceData.system.networkLatency}ms</span>
                </div>
              </CardContent>
            </Card>

            {/* Database Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Database Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Connections</span>
                  <span className="font-medium">{performanceData.database.connectionCount}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Query Response Time</span>
                  <span className={getUsageColor(performanceData.database.queryResponseTime, [50, 100])}>
                    {performanceData.database.queryResponseTime}ms
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Slow Queries</span>
                  <span className={performanceData.database.slowQueries > 0 ? 'text-yellow-600' : 'text-green-600'}>
                    {performanceData.database.slowQueries}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Cache Hit Ratio</span>
                    <span className={getUsageColor(100 - performanceData.database.cacheHitRatio, [20, 40])}>
                      {performanceData.database.cacheHitRatio}%
                    </span>
                  </div>
                  <Progress value={performanceData.database.cacheHitRatio} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* API Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>API Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{performanceData.api.requestsPerSecond.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Requests/sec</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${getUsageColor(performanceData.api.averageResponseTime, [150, 300])}`}>
                    {performanceData.api.averageResponseTime}ms
                  </p>
                  <p className="text-sm text-muted-foreground">Avg Response</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${getUsageColor(performanceData.api.errorRate, [1, 3])}`}>
                    {performanceData.api.errorRate}%
                  </p>
                  <p className="text-sm text-muted-foreground">Error Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{performanceData.api.throughput}</p>
                  <p className="text-sm text-muted-foreground">Throughput/min</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          {/* Optimization Report */}
          {!reportLoading && report.improvements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Optimization Opportunities
                </CardTitle>
                <CardDescription>
                  Areas where performance can be improved
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {report.improvements.map((improvement, index) => (
                      <div key={index} className="p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{improvement.area}</h4>
                          <Badge variant="outline">Priority: {improvement.priority}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Current: </span>
                            <span className="font-medium">{improvement.current}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Target: </span>
                            <span className="font-medium text-green-600">{improvement.target}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{improvement.improvement}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Estimated Gains */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold text-blue-600">{report.estimatedGains.speedIncrease}</p>
                <p className="text-sm text-muted-foreground">Speed Increase</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Gauge className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold text-green-600">{report.estimatedGains.resourceSavings}</p>
                <p className="text-sm text-muted-foreground">Resource Savings</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Activity className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                <p className="text-2xl font-bold text-purple-600">{report.estimatedGains.costReduction}</p>
                <p className="text-sm text-muted-foreground">Cost Reduction</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {performanceData.recommendations.map((rec, index) => (
                <Alert key={index} className={
                  rec.type === 'critical' ? 'border-red-200 bg-red-50' :
                  rec.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                  'border-blue-200 bg-blue-50'
                }>
                  <div className="flex items-start gap-3">
                    {getRecommendationIcon(rec.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTitle className="mb-0">{rec.title}</AlertTitle>
                        <Badge variant="outline" className="text-xs">
                          {rec.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {rec.impact} impact
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {rec.effort} effort
                        </Badge>
                      </div>
                      <AlertDescription className="text-sm mb-2">
                        {rec.description}
                      </AlertDescription>
                      <div className="bg-white/50 p-2 rounded text-xs">
                        <strong>Action:</strong> {rec.action}
                      </div>
                    </div>
                  </div>
                </Alert>
              ))}
              
              {performanceData.recommendations.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <h3 className="text-lg font-medium mb-2">No Issues Found</h3>
                  <p className="text-muted-foreground">Your system is performing optimally.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}