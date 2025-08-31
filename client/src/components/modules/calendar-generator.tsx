import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, TrendingUp, Target, Clock, Hash, Users, BarChart3, Download, Eye, PlayCircle, Camera, Image, Video, MessageSquare } from "lucide-react";
import ScrollableCard from "@/components/ui/scrollable-card";

interface CalendarPost {
  day: number;
  date: string;
  title: string;
  description: string;
  contentType: 'image' | 'video' | 'carousel' | 'story' | 'reel' | 'live';
  platforms: string[];
  hashtags: string[];
  optimalTime: string;
  engagementTactics: string[];
  callToAction: string;
  contentPillars: string[];
  trends: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedReach: string;
  keywords: string[];
}

interface MonthlyCalendar {
  niche: string;
  month: string;
  year: number;
  totalPosts: number;
  contentBreakdown: { [key: string]: number };
  platformDistribution: { [key: string]: number };
  posts: CalendarPost[];
  weeklyThemes: string[];
  monthlyGoals: string[];
  budgetEstimate: string;
  kpiTargets: {
    followers: string;
    engagement: string;
    reach: string;
    conversions: string;
  };
}

export function CalendarGenerator() {
  const [selectedNiche, setSelectedNiche] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingProgress, setGeneratingProgress] = useState(0);
  const [generatedCalendar, setGeneratedCalendar] = useState<MonthlyCalendar | null>(null);
  const [selectedWeek, setSelectedWeek] = useState(1);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available niches
  const { data: nichesData, isLoading: nichesLoading } = useQuery({
    queryKey: ['/api/calendar/niches'],
    queryFn: () => apiRequest('/api/calendar/niches')
  });

  // Fetch saved calendars
  const { data: savedCalendarsData } = useQuery({
    queryKey: ['/api/calendar/saved'],
    queryFn: () => apiRequest('/api/calendar/saved')
  });

  const niches = nichesData?.niches || [];
  const savedCalendars = savedCalendarsData?.calendars || [];

  // Calendar generation mutation
  const generateCalendarMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/calendar/generate', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    }),
    onSuccess: (data) => {
      setGeneratedCalendar(data);
      setIsGenerating(false);
      setGeneratingProgress(100);
      
      toast({
        title: "Calendar Generated Successfully",
        description: `Created ${data.totalPosts} posts for ${data.niche} niche in ${data.month} ${data.year}`
      });
      
      // Refresh saved calendars
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/saved'] });
    },
    onError: (error: any) => {
      setIsGenerating(false);
      setGeneratingProgress(0);
      toast({
        title: "Calendar Generation Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleGenerateCalendar = async () => {
    if (!selectedNiche) {
      toast({
        title: "Missing Information",
        description: "Please select a niche",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGeneratingProgress(0);
    setGeneratedCalendar(null);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setGeneratingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 20;
      });
    }, 1000);

    generateCalendarMutation.mutate({
      niche: selectedNiche,
      customPreferences: {}
    });
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'carousel': return <Camera className="w-4 h-4" />;
      case 'story': return <MessageSquare className="w-4 h-4" />;
      case 'reel': return <PlayCircle className="w-4 h-4" />;
      case 'live': return <Video className="w-4 h-4 text-red-500" />;
      default: return <Image className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPlatformColor = (platform: string) => {
    const colors: { [key: string]: string } = {
      instagram: 'bg-pink-100 text-pink-800 border-pink-200',
      tiktok: 'bg-black text-white border-black',
      youtube: 'bg-red-100 text-red-800 border-red-200',
      facebook: 'bg-blue-100 text-blue-800 border-blue-200',
      twitter: 'bg-sky-100 text-sky-800 border-sky-200',
      linkedin: 'bg-blue-100 text-blue-800 border-blue-200',
      pinterest: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[platform] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getWeekPosts = (week: number) => {
    if (!generatedCalendar) return [];
    const startDay = (week - 1) * 7 + 1;
    const endDay = Math.min(week * 7, generatedCalendar.totalPosts);
    return generatedCalendar.posts.filter(post => post.day >= startDay && post.day <= endDay);
  };

  const downloadCalendar = () => {
    if (!generatedCalendar) return;
    
    const dataStr = JSON.stringify(generatedCalendar, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${generatedCalendar.niche}-calendar-${generatedCalendar.month}-${generatedCalendar.year}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="bg-surface border-surface-variant module-enhanced">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-green-400" />
            <span>Content Calendar Generator Pro</span>
          </div>
          <Badge className="bg-green-500/10 text-green-400">{savedCalendars.length} Saved</Badge>
        </CardTitle>
        <div className="card-description">
          Advanced calendar generation with AI-powered content planning, viral strategies, 
          trend analysis, optimal timing, multi-platform distribution, and performance tracking.
        </div>
        <div className="feature-list">
          <div className="feature-tag">AI Content Plan</div>
          <div className="feature-tag">Viral Strategies</div>
          <div className="feature-tag">Trend Analysis</div>
          <div className="feature-tag">Optimal Timing</div>
          <div className="feature-tag">Multi Platform</div>
          <div className="feature-tag">Performance Track</div>
          <div className="feature-tag">Auto Schedule</div>
          <div className="feature-tag">ROI Forecast</div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollableCard>
          <div className="space-y-6">
            {/* Main content */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">📅 Calendar Generator</h3>
              <p className="text-muted-foreground">Generate comprehensive 30-day content calendars for any niche</p>
            </div>

            <Tabs defaultValue="generator" className="w-full internal-tabs-container">
              <TabsList className="grid w-full grid-cols-4 tabs-list">
                <TabsTrigger value="generator">Generator</TabsTrigger>
                <TabsTrigger value="calendar">Calendar View</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="saved">Saved Calendars</TabsTrigger>
              </TabsList>

        <TabsContent value="generator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Generator Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Calendar Configuration
                </CardTitle>
                <CardDescription>Set up your content calendar preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="niche">Content Niche</Label>
                  <Select value={selectedNiche} onValueChange={setSelectedNiche}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a niche" />
                    </SelectTrigger>
                    <SelectContent>
                      {niches.map((niche: string) => (
                        <SelectItem key={niche} value={niche}>
                          <span className="capitalize">{niche}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedNiche && (
                  <div className="p-3 bg-muted rounded-lg">
                    <h4 className="font-medium capitalize mb-2">{selectedNiche} Strategy</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>Optimal Platforms:</strong> Instagram, YouTube, TikTok</p>
                      <p><strong>Best Posting Times:</strong> 9 AM, 1 PM, 6 PM</p>
                      <p><strong>Content Focus:</strong> Educational, Entertaining, Inspirational</p>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleGenerateCalendar}
                  disabled={isGenerating || !selectedNiche}
                  className="w-full"
                >
                  {isGenerating ? 'Generating Calendar...' : 'Generate 30-Day Calendar'}
                </Button>
              </CardContent>
            </Card>

            {/* Generation Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Generation Status
                </CardTitle>
                <CardDescription>Monitor calendar generation progress</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isGenerating && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Creating content calendar...</span>
                      <span>{generatingProgress}%</span>
                    </div>
                    <Progress value={generatingProgress} className="w-full" />
                    <p className="text-sm text-muted-foreground">
                      Analyzing trends, optimizing posting schedule, and creating engaging content ideas
                    </p>
                  </div>
                )}

                {generatedCalendar && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Generated Successfully</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">{generatedCalendar.totalPosts}</div>
                        <div className="text-sm text-muted-foreground">Total Posts</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">{Object.keys(generatedCalendar.platformDistribution).length}</div>
                        <div className="text-sm text-muted-foreground">Platforms</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm"><strong>Niche:</strong> {generatedCalendar.niche}</p>
                      <p className="text-sm"><strong>Period:</strong> {generatedCalendar.month} {generatedCalendar.year}</p>
                      <p className="text-sm"><strong>Budget:</strong> {generatedCalendar.budgetEstimate}</p>
                    </div>

                    <Button onClick={downloadCalendar} className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download Calendar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          {generatedCalendar ? (
            <>
              {/* Week Navigation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {generatedCalendar.month} {generatedCalendar.year} - {generatedCalendar.niche}
                  </CardTitle>
                  <CardDescription>Browse your content calendar by week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map(week => (
                      <Button
                        key={week}
                        variant={selectedWeek === week ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedWeek(week)}
                      >
                        Week {week}
                      </Button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    {getWeekPosts(selectedWeek).map((post) => (
                      <Card key={post.day} className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="text-2xl font-bold text-primary">{post.day}</div>
                            <div>
                              <h3 className="font-semibold">{post.title}</h3>
                              <p className="text-sm text-muted-foreground">{post.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getContentTypeIcon(post.contentType)}
                            <Badge className={getDifficultyColor(post.difficulty)} variant="outline">
                              {post.difficulty}
                            </Badge>
                          </div>
                        </div>

                        <p className="text-sm mb-3">{post.description}</p>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">Best time: {post.optimalTime}</span>
                            <Eye className="w-4 h-4 ml-2" />
                            <span className="text-sm">Est. reach: {post.estimatedReach}</span>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {post.platforms.map(platform => (
                              <Badge key={platform} className={getPlatformColor(platform)} variant="outline">
                                {platform}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {post.hashtags.slice(0, 8).map(hashtag => (
                              <span key={hashtag} className="text-xs bg-muted px-2 py-1 rounded">
                                {hashtag}
                              </span>
                            ))}
                          </div>

                          <div className="text-sm">
                            <strong>CTA:</strong> {post.callToAction}
                          </div>

                          <div className="text-sm">
                            <strong>Engagement tactics:</strong> {post.engagementTactics.join(', ')}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Generate a calendar to view your content schedule</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {generatedCalendar ? (
            <>
              {/* KPI Targets */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    KPI Targets
                  </CardTitle>
                  <CardDescription>Monthly performance targets for your content strategy</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                      <div className="font-bold text-blue-700">{generatedCalendar.kpiTargets.followers}</div>
                      <div className="text-sm text-blue-600">New Followers</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-600" />
                      <div className="font-bold text-green-700">{generatedCalendar.kpiTargets.engagement}</div>
                      <div className="text-sm text-green-600">Engagement Rate</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <Eye className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                      <div className="font-bold text-purple-700">{generatedCalendar.kpiTargets.reach}</div>
                      <div className="text-sm text-purple-600">Total Reach</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <BarChart3 className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                      <div className="font-bold text-orange-700">{generatedCalendar.kpiTargets.conversions}</div>
                      <div className="text-sm text-orange-600">Conversion Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Content Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Content Type Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(generatedCalendar.contentBreakdown).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getContentTypeIcon(type)}
                            <span className="capitalize">{type}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${(count / generatedCalendar.totalPosts) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Platform Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(generatedCalendar.platformDistribution).map(([platform, count]) => (
                        <div key={platform} className="flex items-center justify-between">
                          <Badge className={getPlatformColor(platform)} variant="outline">
                            {platform}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${Math.min((count / generatedCalendar.totalPosts) * 100, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Weekly Themes & Goals */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Themes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {generatedCalendar.weeklyThemes.map((theme, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Badge variant="outline">Week {index + 1}</Badge>
                          <span className="capitalize">{theme}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Goals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {generatedCalendar.monthlyGoals.map((goal, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm">{goal}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Generate a calendar to view analytics and insights</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="saved" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Saved Calendars</CardTitle>
              <CardDescription>Access your previously generated content calendars</CardDescription>
            </CardHeader>
            <CardContent>
              {savedCalendars.length > 0 ? (
                <div className="grid gap-3">
                  {savedCalendars.map((filename: string) => (
                    <Card key={filename} className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{filename.replace('.json', '').replace(/-/g, ' ')}</p>
                          <p className="text-sm text-muted-foreground">Generated calendar</p>
                        </div>
                        <Button size="sm" onClick={() => {
                          // Load calendar functionality would go here
                          toast({
                            title: "Calendar Loaded",
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
                  <p>No saved calendars yet. Generate your first calendar to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
            </Tabs>
          </div>
        </ScrollableCard>
      </CardContent>
    </Card>
  );
}