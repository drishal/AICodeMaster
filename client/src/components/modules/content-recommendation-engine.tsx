import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  TrendingUp, 
  Target,
  Lightbulb,
  Calendar,
  BarChart3,
  Zap,
  Filter,
  RefreshCw,
  CheckCircle,
  Clock,
  Star,
  ArrowRight,
  MessageSquare,
  Image,
  Video,
  Hash
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ContentRecommendation {
  id: string;
  type: "content" | "strategy" | "optimization" | "automation";
  module: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  priority: number;
  confidence: number;
  estimatedBoost: string;
  actionRequired: string;
  createdAt: string;
  status: "pending" | "applied" | "dismissed";
  metadata?: {
    platform?: string;
    contentType?: string;
    targetAudience?: string;
    bestTime?: string;
    keywords?: string[];
  };
}

interface TrendingTopic {
  id: string;
  topic: string;
  category: string;
  trendScore: number;
  platform: string;
  growth: number;
  relevanceScore: number;
  suggestedContent: string[];
}

interface PerformanceInsight {
  id: string;
  metric: string;
  currentValue: number;
  previousValue: number;
  change: number;
  recommendation: string;
  actionItems: string[];
}

export function ContentRecommendationEngine() {
  const [activeTab, setActiveTab] = useState("recommendations");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterModule, setFilterModule] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock data for recommendations
  const recommendations: ContentRecommendation[] = [
    {
      id: "1",
      type: "content",
      module: "Instagram Manager",
      title: "Post Reels During Peak Hours",
      description: "Your audience is 73% more active between 7-9 PM. Schedule your reels during this window for maximum engagement.",
      impact: "high",
      priority: 95,
      confidence: 0.87,
      estimatedBoost: "+45% engagement",
      actionRequired: "Update posting schedule",
      createdAt: "2 hours ago",
      status: "pending",
      metadata: {
        platform: "instagram",
        contentType: "reel",
        bestTime: "7:00 PM - 9:00 PM",
        targetAudience: "tech entrepreneurs"
      }
    },
    {
      id: "2",
      type: "strategy",
      module: "SEO Manager",
      title: "Target Long-tail Keywords",
      description: "AI analysis shows 'mobile app development tools 2025' has low competition but high search volume in your niche.",
      impact: "high",
      priority: 92,
      confidence: 0.91,
      estimatedBoost: "+320% organic traffic",
      actionRequired: "Create content targeting these keywords",
      createdAt: "4 hours ago",
      status: "pending",
      metadata: {
        keywords: ["mobile app development tools 2025", "no-code app builder", "AI app development"],
        contentType: "blog post"
      }
    },
    {
      id: "3",
      type: "optimization",
      module: "Email Marketing",
      title: "Optimize Subject Lines",
      description: "Subject lines with questions increase open rates by 23% for your audience. Try 'Ready to build your dream app?'",
      impact: "medium",
      priority: 78,
      confidence: 0.82,
      estimatedBoost: "+23% open rate",
      actionRequired: "A/B test new subject line formats",
      createdAt: "6 hours ago", 
      status: "pending",
      metadata: {
        contentType: "email",
        targetAudience: "mobile developers"
      }
    },
    {
      id: "4",
      type: "automation",
      module: "YouTube Manager",
      title: "Auto-generate Shorts from Long Videos",
      description: "Your 15-minute tutorials can be automatically converted into 3-4 engaging Shorts, increasing your content output by 400%.",
      impact: "high",
      priority: 89,
      confidence: 0.85,
      estimatedBoost: "+400% content volume",
      actionRequired: "Enable auto-shorts generation",
      createdAt: "1 day ago",
      status: "pending",
      metadata: {
        platform: "youtube",
        contentType: "shorts"
      }
    }
  ];

  const trendingTopics: TrendingTopic[] = [
    {
      id: "1",
      topic: "AI-powered mobile development",
      category: "Technology",
      trendScore: 95,
      platform: "All platforms",
      growth: 156,
      relevanceScore: 0.92,
      suggestedContent: [
        "Tutorial: Building apps with AI assistance",
        "Reel: AI vs traditional coding comparison",
        "Blog: The future of mobile development"
      ]
    },
    {
      id: "2", 
      topic: "No-code app builders 2025",
      category: "Development Tools",
      trendScore: 88,
      platform: "LinkedIn, YouTube",
      growth: 134,
      relevanceScore: 0.89,
      suggestedContent: [
        "Video: Top no-code platforms review",
        "Post: No-code success stories",
        "Guide: Choosing the right no-code tool"
      ]
    },
    {
      id: "3",
      topic: "Termux automation scripts",
      category: "Mobile Development",
      trendScore: 82,
      platform: "Reddit, GitHub",
      growth: 98,
      relevanceScore: 0.95,
      suggestedContent: [
        "Tutorial: Advanced Termux automation",
        "Repository: Script collection",
        "Video: Mobile development workflow"
      ]
    }
  ];

  const performanceInsights: PerformanceInsight[] = [
    {
      id: "1",
      metric: "Instagram Engagement Rate",
      currentValue: 4.2,
      previousValue: 3.1,
      change: 35.5,
      recommendation: "Your engagement is trending upward. Focus on video content which shows 67% higher engagement.",
      actionItems: [
        "Increase video content to 70% of posts",
        "Use trending audio in reels",
        "Post consistently during peak hours"
      ]
    },
    {
      id: "2",
      metric: "Email Open Rate",
      currentValue: 24.7,
      previousValue: 28.3,
      change: -12.7,
      recommendation: "Open rates declined. Segment your audience and personalize subject lines for better performance.",
      actionItems: [
        "Create audience segments based on behavior",
        "A/B test personalized subject lines",
        "Clean inactive subscribers"
      ]
    },
    {
      id: "3",
      metric: "SEO Organic Traffic",
      currentValue: 1847,
      previousValue: 1654,
      change: 11.7,
      recommendation: "Organic traffic is growing steadily. Double down on long-tail keywords and technical content.",
      actionItems: [
        "Target 5 new long-tail keywords monthly",
        "Create in-depth technical tutorials",
        "Optimize page loading speeds"
      ]
    }
  ];

  const applyRecommendation = useMutation({
    mutationFn: async (recommendationId: string) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Recommendation Applied",
        description: "The optimization has been implemented across your marketing modules.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations"] });
    },
  });

  const dismissRecommendation = useMutation({
    mutationFn: async (recommendationId: string) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Recommendation Dismissed",
        description: "This suggestion has been removed from your queue.",
      });
    },
  });

  const generateNewRecommendations = useMutation({
    mutationFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 3000));
      return { success: true, count: 7 };
    },
    onSuccess: (data) => {
      toast({
        title: "New Recommendations Generated",
        description: `Found ${data.count} new optimization opportunities based on your latest data.`,
      });
    },
  });

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "low":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "content":
        return <MessageSquare className="w-4 h-4" />;
      case "strategy":
        return <Target className="w-4 h-4" />;
      case "optimization":
        return <TrendingUp className="w-4 h-4" />;
      case "automation":
        return <Zap className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  const filteredRecommendations = recommendations.filter(rec => {
    const typeMatch = filterType === "all" || rec.type === filterType;
    const moduleMatch = filterModule === "all" || rec.module.toLowerCase().includes(filterModule.toLowerCase());
    return typeMatch && moduleMatch && rec.status === "pending";
  });

  return (
    <Card className="bg-surface border-surface-variant module-enhanced">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-blue-400" />
            <span>Content Recommendation Engine Pro</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-blue-500/10 text-blue-400">AI-Powered</Badge>
            <Button
              size="sm"
              onClick={() => generateNewRecommendations.mutate()}
              disabled={generateNewRecommendations.isPending}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${generateNewRecommendations.isPending ? 'animate-spin' : ''}`} />
              Analyze
            </Button>
          </div>
        </CardTitle>
        <div className="card-description">
          Advanced AI-powered recommendations with trend analysis, competitor insights, 
          performance predictions, auto-optimization, and personalized content strategies.
        </div>
        <div className="feature-list">
          <div className="feature-tag">AI Recommendations</div>
          <div className="feature-tag">Trend Analysis</div>
          <div className="feature-tag">Competitor Insights</div>
          <div className="feature-tag">Performance Predict</div>
          <div className="feature-tag">Auto Optimize</div>
          <div className="feature-tag">Content Strategy</div>
          <div className="feature-tag">ROI Tracking</div>
          <div className="feature-tag">A/B Testing</div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-surface-variant">
            <TabsTrigger value="recommendations" className="text-xs">Recommendations</TabsTrigger>
            <TabsTrigger value="trends" className="text-xs">Trends</TabsTrigger>
            <TabsTrigger value="insights" className="text-xs">Insights</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations" className="space-y-4">
            <div className="flex items-center space-x-2 flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-text-secondary" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-dark border border-surface-variant rounded px-2 py-1 text-xs"
                >
                  <option value="all">All Types</option>
                  <option value="content">Content</option>
                  <option value="strategy">Strategy</option>
                  <option value="optimization">Optimization</option>
                  <option value="automation">Automation</option>
                </select>
              </div>
              <select
                value={filterModule}
                onChange={(e) => setFilterModule(e.target.value)}
                className="bg-dark border border-surface-variant rounded px-2 py-1 text-xs"
              >
                <option value="all">All Modules</option>
                <option value="instagram">Instagram</option>
                <option value="seo">SEO</option>
                <option value="email">Email</option>
                <option value="youtube">YouTube</option>
              </select>
            </div>

            <div className="space-y-3">
              {filteredRecommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-surface-variant rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getTypeIcon(rec.type)}
                        <h4 className="text-sm font-medium">{rec.title}</h4>
                        <Badge className={getImpactColor(rec.impact)}>
                          {rec.impact} impact
                        </Badge>
                        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                          {rec.module}
                        </Badge>
                      </div>
                      <p className="text-xs text-text-secondary mb-3">
                        {rec.description}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-400" />
                          <span>Priority: {rec.priority}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <BarChart3 className="w-3 h-3 text-green-400" />
                          <span>{rec.estimatedBoost}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Brain className="w-3 h-3 text-blue-400" />
                          <span>{Math.round(rec.confidence * 100)}% confidence</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-text-secondary" />
                          <span>{rec.createdAt}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-dark rounded p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-medium">Action Required</span>
                    </div>
                    <p className="text-xs text-text-secondary mb-3">
                      {rec.actionRequired}
                    </p>
                    
                    {rec.metadata && (
                      <div className="space-y-2 mb-3">
                        {rec.metadata.bestTime && (
                          <div className="flex items-center space-x-2 text-xs">
                            <Calendar className="w-3 h-3 text-blue-400" />
                            <span>Best Time: {rec.metadata.bestTime}</span>
                          </div>
                        )}
                        {rec.metadata.keywords && (
                          <div className="flex items-center space-x-2 text-xs">
                            <Hash className="w-3 h-3 text-green-400" />
                            <span>Keywords: {rec.metadata.keywords.join(", ")}</span>
                          </div>
                        )}
                        {rec.metadata.platform && (
                          <div className="flex items-center space-x-2 text-xs">
                            <Target className="w-3 h-3 text-purple-400" />
                            <span>Platform: {rec.metadata.platform}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        onClick={() => applyRecommendation.mutate(rec.id)}
                        disabled={applyRecommendation.isPending}
                        className="bg-green-500 hover:bg-green-600 text-xs"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Apply
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => dismissRecommendation.mutate(rec.id)}
                        className="text-xs"
                      >
                        Dismiss
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                      >
                        <ArrowRight className="w-3 h-3 mr-1" />
                        View Module
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Trending Topics</span>
              <Badge className="bg-green-500/10 text-green-400 text-xs">
                Updated hourly
              </Badge>
            </div>

            <div className="space-y-3">
              {trendingTopics.map((trend) => (
                <div
                  key={trend.id}
                  className="bg-surface-variant rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-sm font-medium">{trend.topic}</h4>
                        <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20">
                          {trend.category}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-text-secondary mb-3">
                        <span>Platform: {trend.platform}</span>
                        <span className="flex items-center space-x-1">
                          <TrendingUp className="w-3 h-3 text-green-400" />
                          <span className="text-green-400">+{trend.growth}%</span>
                        </span>
                        <span>Relevance: {Math.round(trend.relevanceScore * 100)}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-400">{trend.trendScore}</div>
                      <div className="text-xs text-text-secondary">Trend Score</div>
                    </div>
                  </div>

                  <div className="bg-dark rounded p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-medium">Suggested Content</span>
                    </div>
                    <div className="space-y-1">
                      {trend.suggestedContent.map((suggestion, index) => (
                        <div key={index} className="flex items-center space-x-2 text-xs">
                          <ArrowRight className="w-3 h-3 text-blue-400" />
                          <span>{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Performance Insights</span>
              <Badge className="bg-purple-500/10 text-purple-400 text-xs">
                Last 30 days
              </Badge>
            </div>

            <div className="space-y-3">
              {performanceInsights.map((insight) => (
                <div
                  key={insight.id}
                  className="bg-surface-variant rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium mb-2">{insight.metric}</h4>
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="text-2xl font-bold">
                          {insight.currentValue.toLocaleString()}
                          {insight.metric.includes("Rate") ? "%" : ""}
                        </div>
                        <div className={`flex items-center space-x-1 text-sm ${
                          insight.change > 0 ? "text-green-400" : "text-red-400"
                        }`}>
                          <TrendingUp className={`w-4 h-4 ${
                            insight.change < 0 ? "rotate-180" : ""
                          }`} />
                          <span>{insight.change > 0 ? "+" : ""}{insight.change.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-dark rounded p-3 space-y-3">
                    <p className="text-xs text-text-secondary">
                      {insight.recommendation}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm font-medium">Action Items</span>
                      </div>
                      {insight.actionItems.map((action, index) => (
                        <div key={index} className="flex items-center space-x-2 text-xs ml-6">
                          <ArrowRight className="w-3 h-3 text-blue-400" />
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="bg-surface-variant rounded-lg p-4 space-y-4">
              <h5 className="text-sm font-medium">Recommendation Settings</h5>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm">Auto-apply Low Impact Recommendations</div>
                    <div className="text-xs text-text-secondary">Automatically implement safe optimizations</div>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs">
                    Enabled
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm">Trend Analysis Frequency</div>
                    <div className="text-xs text-text-secondary">How often to scan for new trends</div>
                  </div>
                  <select className="bg-dark border border-surface-variant rounded px-2 py-1 text-xs">
                    <option>Every Hour</option>
                    <option>Every 6 Hours</option>
                    <option>Daily</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm">Minimum Confidence Threshold</div>
                    <div className="text-xs text-text-secondary">Only show recommendations above this confidence</div>
                  </div>
                  <select className="bg-dark border border-surface-variant rounded px-2 py-1 text-xs">
                    <option>70%</option>
                    <option>80%</option>
                    <option>90%</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-surface-variant rounded-lg p-4 space-y-3">
              <h5 className="text-sm font-medium">Notification Preferences</h5>
              
              <div className="space-y-2">
                {[
                  "High impact recommendations",
                  "Trending topic alerts", 
                  "Performance anomalies",
                  "Weekly insights summary"
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-xs">{item}</span>
                    <Button size="sm" variant="outline" className="text-xs">
                      On
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Brain className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">AI Intelligence Features</span>
          </div>
          <ul className="text-xs text-text-secondary space-y-1">
            <li>• Cross-platform performance analysis and optimization suggestions</li>
            <li>• Real-time trend detection with content opportunity identification</li>
            <li>• Predictive analytics for optimal posting times and content types</li>
            <li>• Automated A/B testing recommendations and result analysis</li>
            <li>• Audience behavior insights with personalization suggestions</li>
            <li>• ROI optimization with budget reallocation recommendations</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}