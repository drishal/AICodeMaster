import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { TrendingUp, TrendingDown, Eye, Clock, Globe, Youtube, Search, BarChart3, Download, RefreshCw, Hash, Calendar } from "lucide-react";

interface TrendData {
  keyword: string;
  rank: number;
  searchVolume: string;
  category: string;
  region: string;
  timestamp: Date;
  relatedQueries: string[];
  risingQueries: string[];
  trend: 'rising' | 'stable' | 'declining';
  score: number;
}

interface YouTubeTrendData {
  title: string;
  channel: string;
  views: string;
  publishedTime: string;
  duration: string;
  category: string;
  tags: string[];
  trending_rank: number;
  engagement_rate: number;
  thumbnail_url: string;
  video_id: string;
  description_snippet: string;
}

interface TrendsAnalysis {
  googleTrends: TrendData[];
  youtubeTrends: YouTubeTrendData[];
  combinedInsights: {
    topKeywords: string[];
    emergingTopics: string[];
    contentOpportunities: string[];
    bestTimes: string[];
    recommendedHashtags: string[];
  };
  regionData: {
    region: string;
    topTrends: string[];
    localInterests: string[];
  };
  timestamp: Date;
}

export function TrendsScraper() {
  const [selectedCategory, setSelectedCategory] = useState('technology');
  const [selectedRegion, setSelectedRegion] = useState('Global');
  const [timeframe, setTimeframe] = useState('1d');
  const [includeYouTube, setIncludeYouTube] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentAnalysis, setCurrentAnalysis] = useState<TrendsAnalysis | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available categories
  const { data: categoriesData } = useQuery({
    queryKey: ['/api/trends/categories'],
    queryFn: () => apiRequest('/api/trends/categories')
  });

  // Fetch available regions
  const { data: regionsData } = useQuery({
    queryKey: ['/api/trends/regions'],
    queryFn: () => apiRequest('/api/trends/regions')
  });

  // Fetch Google Trends
  const { data: googleTrendsData, isLoading: googleLoading, refetch: refetchGoogle } = useQuery({
    queryKey: ['/api/trends/google', selectedCategory, selectedRegion, timeframe],
    queryFn: () => apiRequest(`/api/trends/google?category=${selectedCategory}&region=${selectedRegion}&timeframe=${timeframe}&limit=20`),
    enabled: false
  });

  // Fetch YouTube Trends
  const { data: youtubeTrendsData, isLoading: youtubeLoading, refetch: refetchYoutube } = useQuery({
    queryKey: ['/api/trends/youtube', selectedCategory, selectedRegion],
    queryFn: () => apiRequest(`/api/trends/youtube?category=${selectedCategory}&region=${selectedRegion}&limit=25`),
    enabled: false
  });

  // Fetch saved analyses
  const { data: savedAnalysesData } = useQuery({
    queryKey: ['/api/trends/saved'],
    queryFn: () => apiRequest('/api/trends/saved')
  });

  const categories = categoriesData?.categories || [];
  const regions = regionsData?.regions || [];
  const googleTrends = googleTrendsData?.trends || [];
  const youtubeTrends = youtubeTrendsData?.trends || [];
  const savedAnalyses = savedAnalysesData?.analyses || [];

  // Comprehensive analysis mutation
  const analysisMutation = useMutation({
    mutationFn: (params: any) => apiRequest(`/api/trends/analysis?categories=${params.categories.join(',')}&region=${params.region}&includeYouTube=${params.includeYouTube}`),
    onSuccess: (data) => {
      setCurrentAnalysis(data);
      setIsAnalyzing(false);
      setAnalysisProgress(100);
      
      toast({
        title: "Analysis Complete",
        description: `Analyzed ${data.googleTrends.length} Google trends and ${data.youtubeTrends.length} YouTube trends`
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/trends/saved'] });
    },
    onError: (error: any) => {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleComprehensiveAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setCurrentAnalysis(null);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 15;
      });
    }, 800);

    analysisMutation.mutate({
      categories: [selectedCategory],
      region: selectedRegion,
      includeYouTube
    });
  };

  const handleRefreshTrends = () => {
    refetchGoogle();
    if (includeYouTube) {
      refetchYoutube();
    }
    toast({
      title: "Refreshing Trends",
      description: "Fetching latest trending data..."
    });
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <BarChart3 className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'rising': return 'bg-green-100 text-green-800 border-green-200';
      case 'declining': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const downloadAnalysis = () => {
    if (!currentAnalysis) return;
    
    const dataStr = JSON.stringify(currentAnalysis, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trends-analysis-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="trend-scraper-tabs">
      <Card className="bg-surface border-surface-variant">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span>Trends Scraper</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="scraper" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="scraper">Trends Scraper</TabsTrigger>
          <TabsTrigger value="google">Google Trends</TabsTrigger>
          <TabsTrigger value="youtube">YouTube Trends</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="saved">Saved Data</TabsTrigger>
        </TabsList>

        <TabsContent value="scraper" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scraper Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Scraper Configuration
                </CardTitle>
                <CardDescription>Configure trending data collection parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category: string) => (
                          <SelectItem key={category} value={category}>
                            <span className="capitalize">{category}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="region">Region</Label>
                    <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((region: string) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="timeframe">Timeframe</Label>
                  <Select value={timeframe} onValueChange={setTimeframe}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">Last Hour</SelectItem>
                      <SelectItem value="4h">Last 4 Hours</SelectItem>
                      <SelectItem value="1d">Last Day</SelectItem>
                      <SelectItem value="7d">Last Week</SelectItem>
                      <SelectItem value="30d">Last Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="youtube"
                    checked={includeYouTube}
                    onCheckedChange={setIncludeYouTube}
                  />
                  <Label htmlFor="youtube">Include YouTube Trends</Label>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleRefreshTrends}
                    disabled={googleLoading || youtubeLoading}
                    className="flex-1"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Trends
                  </Button>
                  <Button 
                    onClick={handleComprehensiveAnalysis}
                    disabled={isAnalyzing}
                    variant="default"
                    className="flex-1"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Full Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Analysis Status
                </CardTitle>
                <CardDescription>Monitor trends analysis progress</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isAnalyzing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Analyzing trends...</span>
                      <span>{analysisProgress}%</span>
                    </div>
                    <Progress value={analysisProgress} className="w-full" />
                    <p className="text-sm text-muted-foreground">
                      Scraping Google Trends, YouTube data, and generating insights
                    </p>
                  </div>
                )}

                {currentAnalysis && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Analysis Complete</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">{currentAnalysis.googleTrends.length}</div>
                        <div className="text-sm text-muted-foreground">Google Trends</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">{currentAnalysis.youtubeTrends.length}</div>
                        <div className="text-sm text-muted-foreground">YouTube Trends</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm"><strong>Region:</strong> {currentAnalysis.regionData.region}</p>
                      <p className="text-sm"><strong>Top Keywords:</strong> {currentAnalysis.combinedInsights.topKeywords.slice(0, 3).join(', ')}</p>
                      <p className="text-sm"><strong>Analysis Time:</strong> {new Date(currentAnalysis.timestamp).toLocaleString()}</p>
                    </div>

                    <Button onClick={downloadAnalysis} className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download Analysis
                    </Button>
                  </div>
                )}

                {!isAnalyzing && !currentAnalysis && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="w-12 h-12 mx-auto mb-4" />
                    <p>Configure settings and start analysis</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="google" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Google Trends - {selectedCategory} ({selectedRegion})
              </CardTitle>
              <CardDescription>Live trending searches from Google</CardDescription>
            </CardHeader>
            <CardContent>
              {googleLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                  <span>Loading Google Trends...</span>
                </div>
              ) : googleTrends.length > 0 ? (
                <div className="space-y-4">
                  {googleTrends.map((trend: TrendData, index: number) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl font-bold text-primary">#{trend.rank}</div>
                          <div>
                            <h3 className="font-semibold">{trend.keyword}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Eye className="w-4 h-4" />
                              <span>{trend.searchVolume}</span>
                              <span>•</span>
                              <span>{trend.category}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(trend.trend)}
                          <Badge className={getTrendColor(trend.trend)} variant="outline">
                            {trend.trend}
                          </Badge>
                          <Badge variant="secondary">{trend.score}</Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium">Related Queries:</p>
                          <div className="flex flex-wrap gap-1">
                            {trend.relatedQueries.slice(0, 4).map((query, i) => (
                              <span key={i} className="text-xs bg-muted px-2 py-1 rounded">
                                {query}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium">Rising Queries:</p>
                          <div className="flex flex-wrap gap-1">
                            {trend.risingQueries.slice(0, 4).map((query, i) => (
                              <span key={i} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                {query}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="w-12 h-12 mx-auto mb-4" />
                  <p>Click "Refresh Trends" to load Google Trends data</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="youtube" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Youtube className="w-5 h-5" />
                YouTube Trending - {selectedCategory} ({selectedRegion})
              </CardTitle>
              <CardDescription>Trending videos from YouTube</CardDescription>
            </CardHeader>
            <CardContent>
              {youtubeLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                  <span>Loading YouTube Trends...</span>
                </div>
              ) : youtubeTrends.length > 0 ? (
                <div className="space-y-4">
                  {youtubeTrends.map((video: YouTubeTrendData, index: number) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="text-2xl font-bold text-primary min-w-[3rem]">
                          #{video.trending_rank}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">{video.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{video.description_snippet}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <span>{video.channel}</span>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              <span>{video.views} views</span>
                            </div>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{video.duration}</span>
                            </div>
                            <span>•</span>
                            <span>{video.publishedTime}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-1">
                              {video.tags.slice(0, 4).map((tag, i) => (
                                <span key={i} className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{video.category}</Badge>
                              <Badge variant="secondary">{video.engagement_rate}% engagement</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Youtube className="w-12 h-12 mx-auto mb-4" />
                  <p>Click "Refresh Trends" to load YouTube trending data</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {currentAnalysis ? (
            <>
              {/* Insights Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Search className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold">Top Keywords</h3>
                  </div>
                  <p className="text-2xl font-bold">{currentAnalysis.combinedInsights.topKeywords.length}</p>
                  <p className="text-sm text-muted-foreground">Trending keywords identified</p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold">Emerging Topics</h3>
                  </div>
                  <p className="text-2xl font-bold">{currentAnalysis.combinedInsights.emergingTopics.length}</p>
                  <p className="text-sm text-muted-foreground">Rising trends detected</p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Hash className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold">Hashtags</h3>
                  </div>
                  <p className="text-2xl font-bold">{currentAnalysis.combinedInsights.recommendedHashtags.length}</p>
                  <p className="text-sm text-muted-foreground">Recommended hashtags</p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-5 h-5 text-orange-600" />
                    <h3 className="font-semibold">Region</h3>
                  </div>
                  <p className="text-lg font-bold">{currentAnalysis.regionData.region}</p>
                  <p className="text-sm text-muted-foreground">Analysis region</p>
                </Card>
              </div>

              {/* Detailed Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Keywords & Topics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Trending Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {currentAnalysis.combinedInsights.topKeywords.slice(0, 10).map((keyword, i) => (
                          <Badge key={i} variant="outline" className="bg-blue-50">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Emerging Topics</h4>
                      <div className="flex flex-wrap gap-2">
                        {currentAnalysis.combinedInsights.emergingTopics.map((topic, i) => (
                          <Badge key={i} variant="outline" className="bg-green-50">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Content Strategy</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Content Opportunities</h4>
                      <ul className="space-y-1">
                        {currentAnalysis.combinedInsights.contentOpportunities.map((opportunity, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                            <span>{opportunity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Best Posting Times</h4>
                      <div className="flex flex-wrap gap-2">
                        {currentAnalysis.combinedInsights.bestTimes.map((time, i) => (
                          <Badge key={i} variant="outline" className="bg-orange-50">
                            <Clock className="w-3 h-3 mr-1" />
                            {time}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Recommended Hashtags</h4>
                      <div className="flex flex-wrap gap-1">
                        {currentAnalysis.combinedInsights.recommendedHashtags.slice(0, 8).map((hashtag, i) => (
                          <span key={i} className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            {hashtag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Run a comprehensive analysis to view insights</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="saved" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Saved Analyses</CardTitle>
              <CardDescription>Access your previously generated trends analyses</CardDescription>
            </CardHeader>
            <CardContent>
              {savedAnalyses.length > 0 ? (
                <div className="grid gap-3">
                  {savedAnalyses.map((filename: string) => (
                    <Card key={filename} className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{filename.replace('trends-analysis-', '').replace('.json', '')}</p>
                          <p className="text-sm text-muted-foreground">Trends analysis data</p>
                        </div>
                        <Button size="sm" onClick={() => {
                          toast({
                            title: "Analysis Loaded",
                            description: `Loaded ${filename}`
                          });
                        }}>
                          Load
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4" />
                  <p>No saved analyses yet. Run your first comprehensive analysis to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}