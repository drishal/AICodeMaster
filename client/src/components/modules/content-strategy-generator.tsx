import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Brain, 
  Target, 
  TrendingUp, 
  DollarSign,
  Users,
  Calendar,
  Lightbulb,
  BarChart3,
  Zap,
  CheckCircle,
  AlertTriangle,
  Info,
  Play,
  Download,
  Sparkles,
  Globe,
  Clock,
  Award,
  Eye
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ContentStrategy {
  id: string;
  title: string;
  description: string;
  targetAudience: string;
  platforms: string[];
  objectives: string[];
  contentTypes: ContentType[];
  timeline: Timeline;
  metrics: PerformanceMetrics;
  recommendations: Recommendation[];
  budget: BudgetAllocation;
  competitorAnalysis: CompetitorInsight[];
  trendAnalysis: TrendData[];
  aiInsights: AIInsight[];
}

interface ContentType {
  type: string;
  frequency: string;
  optimalTimes: string[];
  engagement: number;
  reach: number;
  conversion: number;
}

interface Timeline {
  duration: string;
  milestones: Milestone[];
  phases: Phase[];
}

interface Milestone {
  date: string;
  title: string;
  description: string;
  kpis: string[];
}

interface Phase {
  name: string;
  duration: string;
  focus: string;
  activities: string[];
  expectedOutcomes: string[];
}

interface PerformanceMetrics {
  expectedReach: number;
  expectedEngagement: number;
  expectedConversions: number;
  expectedROI: number;
  trackingKPIs: string[];
}

interface Recommendation {
  category: string;
  priority: string;
  title: string;
  description: string;
  implementation: string;
  expectedImpact: string;
  effort: string;
  tools: string[];
}

interface BudgetAllocation {
  total: number;
  breakdown: {
    contentCreation: number;
    advertising: number;
    tools: number;
    influencers: number;
    analytics: number;
  };
  recommendations: string[];
}

interface CompetitorInsight {
  competitor: string;
  platform: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  contentStrategy: string;
  performanceMetrics: {
    followers: number;
    engagement: number;
    postFrequency: string;
  };
}

interface TrendData {
  trend: string;
  platform: string[];
  growth: number;
  relevance: number;
  difficulty: number;
  opportunities: string[];
  timeline: string;
}

interface AIInsight {
  type: string;
  title: string;
  insight: string;
  actionable: string;
  confidence: number;
  impact: string;
}

export default function ContentStrategyGenerator() {
  const [activeTab, setActiveTab] = useState("generator");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [generatedStrategy, setGeneratedStrategy] = useState<ContentStrategy | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    industry: "",
    targetAudience: "",
    platforms: [] as string[],
    objectives: [] as string[],
    budget: 1000,
    timeline: "1month"
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch template strategies
  const { data: templates } = useQuery({
    queryKey: ['/api/content-strategy/templates']
  });

  // Generate strategy mutation
  const generateStrategy = useMutation({
    mutationFn: async (params: any) => {
      const response = await apiRequest('/api/content-strategy/generate', {
        method: 'POST',
        body: JSON.stringify(params),
        headers: { 'Content-Type': 'application/json' }
      });
      return response;
    },
    onSuccess: (data) => {
      setGeneratedStrategy(data as ContentStrategy);
      setActiveTab("strategy");
      toast({ title: "Strategy generated successfully!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Generation failed", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  const handlePlatformChange = (platform: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      platforms: checked 
        ? [...prev.platforms, platform]
        : prev.platforms.filter(p => p !== platform)
    }));
  };

  const handleObjectiveChange = (objective: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      objectives: checked 
        ? [...prev.objectives, objective]
        : prev.objectives.filter(o => o !== objective)
    }));
  };

  const handleGenerate = () => {
    if (!formData.industry || !formData.targetAudience || formData.platforms.length === 0) {
      toast({ 
        title: "Missing information", 
        description: "Please fill in all required fields", 
        variant: "destructive" 
      });
      return;
    }

    setIsGenerating(true);
    generateStrategy.mutate(formData);
  };

  const handleTemplateSelect = (templateData: any) => {
    setFormData(prev => ({
      ...prev,
      industry: templateData.title.includes('Tech') ? 'technology' : 
                templateData.title.includes('E-commerce') ? 'ecommerce' : 'business',
      targetAudience: templateData.targetAudience,
      platforms: templateData.platforms,
      objectives: templateData.objectives
    }));
    toast({ title: "Template applied successfully!" });
  };

  const exportStrategy = async () => {
    if (!generatedStrategy) return;
    
    const dataStr = JSON.stringify(generatedStrategy, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `content-strategy-${generatedStrategy.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({ title: "Strategy exported successfully!" });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'medium': return <BarChart3 className="w-4 h-4 text-yellow-600" />;
      case 'low': return <Target className="w-4 h-4 text-blue-600" />;
      default: return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <Card className="bg-surface border-surface-variant module-enhanced">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-400" />
            <span>Content Strategy Generator Pro</span>
          </div>
          <Badge className="bg-purple-500/10 text-purple-400">AI-Powered</Badge>
        </CardTitle>
        <div className="card-description">
          Advanced strategy generation with competitor analysis, trend forecasting, 
          budget optimization, content planning, and comprehensive ROI tracking.
        </div>
        <div className="feature-list">
          <div className="feature-tag">AI Strategy</div>
          <div className="feature-tag">Competitor Analysis</div>
          <div className="feature-tag">Trend Forecast</div>
          <div className="feature-tag">Budget Optimize</div>
          <div className="feature-tag">Content Planning</div>
          <div className="feature-tag">ROI Tracking</div>
          <div className="feature-tag">Multi Platform</div>
          <div className="feature-tag">Export Plans</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Main content */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">AI Content Strategy Generator</h3>
              <p className="text-muted-foreground">
                Create intelligent, data-driven content strategies for maximum engagement and ROI
              </p>
            </div>
        {generatedStrategy && (
          <Button onClick={exportStrategy} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Strategy
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generator">Generator</TabsTrigger>
          <TabsTrigger value="strategy">Strategy</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strategy Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Strategy Parameters
                </CardTitle>
                <CardDescription>
                  Define your content strategy requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry *</Label>
                  <Input
                    id="industry"
                    placeholder="e.g., Technology, E-commerce, Healthcare"
                    value={formData.industry}
                    onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audience">Target Audience *</Label>
                  <Input
                    id="audience"
                    placeholder="e.g., Tech professionals aged 25-40"
                    value={formData.targetAudience}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Platforms *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Instagram', 'Facebook', 'YouTube', 'LinkedIn', 'Twitter', 'TikTok'].map(platform => (
                      <div key={platform} className="flex items-center space-x-2">
                        <Checkbox
                          id={platform}
                          checked={formData.platforms.includes(platform.toLowerCase())}
                          onCheckedChange={(checked) => 
                            handlePlatformChange(platform.toLowerCase(), checked as boolean)
                          }
                        />
                        <Label htmlFor={platform}>{platform}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Objectives</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {['Brand Awareness', 'Lead Generation', 'Sales Growth', 'Community Building', 'Thought Leadership'].map(objective => (
                      <div key={objective} className="flex items-center space-x-2">
                        <Checkbox
                          id={objective}
                          checked={formData.objectives.includes(objective)}
                          onCheckedChange={(checked) => 
                            handleObjectiveChange(objective, checked as boolean)
                          }
                        />
                        <Label htmlFor={objective}>{objective}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Monthly Budget ($)</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: parseInt(e.target.value) || 0 }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeline">Timeline</Label>
                  <Select value={formData.timeline} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, timeline: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1month">1 Month</SelectItem>
                      <SelectItem value="3months">3 Months</SelectItem>
                      <SelectItem value="6months">6 Months</SelectItem>
                      <SelectItem value="1year">1 Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleGenerate} 
                  className="w-full" 
                  disabled={generateStrategy.isPending}
                >
                  {generateStrategy.isPending ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Generating Strategy...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Generate AI Strategy
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Quick Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Quick Start Templates
                </CardTitle>
                <CardDescription>
                  Use pre-built templates to get started quickly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {(templates && Array.isArray(templates) ? templates : []).map((template: any, index: number) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <h4 className="font-medium mb-1">{template.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {template.platforms?.map((platform: string) => (
                            <Badge key={platform} variant="secondary" className="text-xs">
                              {platform}
                            </Badge>
                          ))}
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleTemplateSelect(template)}
                          className="w-full"
                        >
                          Use Template
                        </Button>
                      </div>
                    )) || (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">Loading templates...</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="strategy" className="space-y-6">
          {generatedStrategy ? (
            <>
              {/* Strategy Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    {generatedStrategy.title}
                  </CardTitle>
                  <CardDescription>{generatedStrategy.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <Users className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                      <p className="text-2xl font-bold">{generatedStrategy.metrics.expectedReach.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Expected Reach</p>
                    </div>
                    <div className="text-center">
                      <Eye className="w-8 h-8 mx-auto mb-2 text-green-500" />
                      <p className="text-2xl font-bold">{generatedStrategy.metrics.expectedEngagement.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Engagement</p>
                    </div>
                    <div className="text-center">
                      <Target className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                      <p className="text-2xl font-bold">{generatedStrategy.metrics.expectedConversions.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Conversions</p>
                    </div>
                    <div className="text-center">
                      <DollarSign className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                      <p className="text-2xl font-bold">{generatedStrategy.metrics.expectedROI}%</p>
                      <p className="text-sm text-muted-foreground">Expected ROI</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Content Types & Schedule */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Content Types</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {generatedStrategy.contentTypes.map((content, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium capitalize">{content.type}</h4>
                            <Badge variant="outline">{content.frequency}</Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Engagement: </span>
                              <span className="font-medium">{content.engagement}%</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Reach: </span>
                              <span className="font-medium">{content.reach}%</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Conversion: </span>
                              <span className="font-medium">{content.conversion}%</span>
                            </div>
                          </div>
                          <div className="mt-2">
                            <p className="text-xs text-muted-foreground">
                              Optimal times: {content.optimalTimes.join(', ')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Budget Allocation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center mb-4">
                        <p className="text-3xl font-bold">${generatedStrategy.budget.total.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Total Monthly Budget</p>
                      </div>
                      
                      {Object.entries(generatedStrategy.budget.breakdown).map(([category, amount]) => (
                        <div key={category} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="capitalize font-medium">{category.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <span className="font-bold">${amount.toLocaleString()}</span>
                          </div>
                          <Progress value={(amount / generatedStrategy.budget.total) * 100} />
                          <p className="text-xs text-muted-foreground">
                            {((amount / generatedStrategy.budget.total) * 100).toFixed(1)}% of total budget
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle>Strategic Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generatedStrategy.recommendations.map((rec, index) => (
                      <Alert key={index} className="p-4">
                        <div className="flex items-start gap-3">
                          {getImpactIcon(rec.expectedImpact.includes('high') ? 'high' : 
                                        rec.expectedImpact.includes('medium') ? 'medium' : 'low')}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTitle className="mb-0">{rec.title}</AlertTitle>
                              <Badge className={getPriorityColor(rec.priority)}>
                                {rec.priority} priority
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {rec.category}
                              </Badge>
                            </div>
                            <AlertDescription className="mb-3">
                              {rec.description}
                            </AlertDescription>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="font-medium">Implementation: </span>
                                {rec.implementation}
                              </div>
                              <div>
                                <span className="font-medium">Expected Impact: </span>
                                <span className="text-green-600">{rec.expectedImpact}</span>
                              </div>
                              <div>
                                <span className="font-medium">Effort: </span>
                                <Badge variant="outline" className="text-xs">{rec.effort}</Badge>
                              </div>
                              <div>
                                <span className="font-medium">Tools: </span>
                                {rec.tools.join(', ')}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-12">
              <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Strategy Generated</h3>
              <p className="text-muted-foreground mb-4">
                Generate a content strategy to see detailed insights and recommendations.
              </p>
              <Button onClick={() => setActiveTab("generator")}>
                <Play className="w-4 h-4 mr-2" />
                Generate Strategy
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {generatedStrategy?.aiInsights ? (
            <div className="space-y-4">
              {generatedStrategy.aiInsights.map((insight, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-500" />
                      {insight.title}
                      <Badge variant="outline" className="ml-auto">
                        {insight.confidence}% confidence
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium mb-1">AI Insight</h4>
                        <p className="text-muted-foreground">{insight.insight}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Actionable Recommendation</h4>
                        <p className="text-sm bg-blue-50 p-3 rounded-lg">{insight.actionable}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={
                          insight.impact === 'high' ? 'bg-green-100 text-green-800' :
                          insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }>
                          {insight.impact} impact
                        </Badge>
                        <Badge variant="outline">{insight.type.replace('_', ' ')}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No AI Insights Available</h3>
              <p className="text-muted-foreground">
                Generate a strategy to unlock AI-powered insights and recommendations.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(templates && Array.isArray(templates) ? templates : []).map((template: any, index: number) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{template.title}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1">Target Audience</p>
                      <p className="text-sm text-muted-foreground">{template.targetAudience}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Platforms</p>
                      <div className="flex flex-wrap gap-1">
                        {template.platforms?.map((platform: string) => (
                          <Badge key={platform} variant="secondary" className="text-xs">
                            {platform}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Objectives</p>
                      <div className="flex flex-wrap gap-1">
                        {template.objectives?.map((objective: string) => (
                          <Badge key={objective} variant="outline" className="text-xs">
                            {objective}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleTemplateSelect(template)}
                      className="w-full mt-4"
                      variant="outline"
                    >
                      Use This Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )) || (
              <div className="col-span-full text-center py-8">
                <Lightbulb className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Loading strategy templates...</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}