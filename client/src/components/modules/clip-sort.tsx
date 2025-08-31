import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { FolderOpen, Heart, BarChart3, Play, SortAsc, Filter, Video } from "lucide-react";
import ScrollableCard from "@/components/ui/scrollable-card";

interface ClipMetadata {
  id: string;
  filename: string;
  path: string;
  niche: string;
  emotion: string;
  confidence: number;
  duration?: number;
  size: number;
  createdAt: Date;
  tags: string[];
}

interface SortResult {
  success: boolean;
  sortedClips?: ClipMetadata[];
  error?: string;
  totalClips?: number;
  categories?: { [key: string]: number };
}

export function ClipSort() {
  const [isSorting, setIsSorting] = useState(false);
  const [sortingProgress, setSortingProgress] = useState(0);
  const [sortResult, setSortResult] = useState<SortResult | null>(null);
  const [selectedNiche, setSelectedNiche] = useState<string>('');
  const [selectedEmotion, setSelectedEmotion] = useState<string>('');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available niches
  const { data: nichesData } = useQuery({
    queryKey: ['/api/clip-sort/niches'],
    queryFn: () => apiRequest('/api/clip-sort/niches')
  });

  // Fetch available emotions
  const { data: emotionsData } = useQuery({
    queryKey: ['/api/clip-sort/emotions'],
    queryFn: () => apiRequest('/api/clip-sort/emotions')
  });

  // Fetch clips by niche
  const { data: nicheClips, refetch: refetchNicheClips } = useQuery({
    queryKey: ['/api/clip-sort/by-niche', selectedNiche],
    queryFn: () => apiRequest(`/api/clip-sort/by-niche/${selectedNiche}`),
    enabled: !!selectedNiche
  });

  // Fetch clips by emotion
  const { data: emotionClips, refetch: refetchEmotionClips } = useQuery({
    queryKey: ['/api/clip-sort/by-emotion', selectedEmotion],
    queryFn: () => apiRequest(`/api/clip-sort/by-emotion/${selectedEmotion}`),
    enabled: !!selectedEmotion
  });

  const niches = nichesData?.niches || [];
  const emotions = emotionsData?.emotions || [];

  // Sort clips mutation
  const sortClipsMutation = useMutation({
    mutationFn: () => apiRequest('/api/clip-sort/sort', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }),
    onSuccess: (data) => {
      setSortResult(data);
      setIsSorting(false);
      setSortingProgress(100);
      
      if (data.success) {
        toast({
          title: "Clips Sorted Successfully",
          description: `Analyzed and sorted ${data.totalClips} clips by niche and emotion`
        });
        
        // Refresh all data
        queryClient.invalidateQueries({ queryKey: ['/api/clip-sort/niches'] });
        queryClient.invalidateQueries({ queryKey: ['/api/clip-sort/emotions'] });
      } else {
        toast({
          title: "Sorting Failed",
          description: data.error,
          variant: "destructive"
        });
      }
    },
    onError: (error: any) => {
      setIsSorting(false);
      setSortingProgress(0);
      toast({
        title: "Sorting Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSortClips = async () => {
    setIsSorting(true);
    setSortingProgress(0);
    setSortResult(null);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setSortingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 15;
      });
    }, 800);

    sortClipsMutation.mutate();
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getEmotionColor = (emotion: string) => {
    const colors: { [key: string]: string } = {
      happy: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      excited: 'bg-orange-100 text-orange-800 border-orange-200',
      calm: 'bg-blue-100 text-blue-800 border-blue-200',
      serious: 'bg-gray-100 text-gray-800 border-gray-200',
      positive: 'bg-green-100 text-green-800 border-green-200',
      neutral: 'bg-slate-100 text-slate-800 border-slate-200',
      intense: 'bg-red-100 text-red-800 border-red-200',
      dynamic: 'bg-purple-100 text-purple-800 border-purple-200',
      peaceful: 'bg-teal-100 text-teal-800 border-teal-200',
      contemplative: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      balanced: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    };
    return colors[emotion] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getNicheColor = (niche: string) => {
    const colors: { [key: string]: string } = {
      gaming: 'bg-violet-100 text-violet-800 border-violet-200',
      food: 'bg-orange-100 text-orange-800 border-orange-200',
      fitness: 'bg-red-100 text-red-800 border-red-200',
      tech: 'bg-blue-100 text-blue-800 border-blue-200',
      music: 'bg-pink-100 text-pink-800 border-pink-200',
      travel: 'bg-green-100 text-green-800 border-green-200',
      comedy: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      education: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      lifestyle: 'bg-teal-100 text-teal-800 border-teal-200',
      entertainment: 'bg-purple-100 text-purple-800 border-purple-200',
      sports: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      cinematic: 'bg-slate-100 text-slate-800 border-slate-200',
      general: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[niche] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <Card className="bg-surface border-surface-variant module-enhanced">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Video className="w-5 h-5 text-purple-400" />
            <span>Clip Sort & Organizer Pro</span>
          </div>
          <Badge className="bg-purple-500/10 text-purple-400">AI Powered</Badge>
        </CardTitle>
        <div className="card-description">
          Advanced clip organization with AI-powered sorting, emotion analysis, niche detection, 
          batch processing, smart tagging, and automated content categorization.
        </div>
        <div className="feature-list">
          <div className="feature-tag">AI Sorting</div>
          <div className="feature-tag">Emotion Analysis</div>
          <div className="feature-tag">Niche Detection</div>
          <div className="feature-tag">Batch Process</div>
          <div className="feature-tag">Smart Tagging</div>
          <div className="feature-tag">Auto Categorize</div>
          <div className="feature-tag">Content Score</div>
          <div className="feature-tag">Quick Export</div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollableCard>
          <div className="space-y-6">
            {/* Main content */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">📂 Clip Sort</h3>
              <p className="text-muted-foreground">AI-powered clip organization by niche and emotion</p>
            </div>

            <Tabs defaultValue="sort" className="w-full internal-tabs-container">
              <TabsList className="grid w-full grid-cols-4 tabs-list">
                <TabsTrigger value="sort">Sort Clips</TabsTrigger>
                <TabsTrigger value="niches">By Niche</TabsTrigger>
                <TabsTrigger value="emotions">By Emotion</TabsTrigger>
                <TabsTrigger value="results">Results</TabsTrigger>
              </TabsList>

              <TabsContent value="sort" className="space-y-6 tabs-content tab-scrollable">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SortAsc className="w-5 h-5" />
                Clip Sorting
              </CardTitle>
              <CardDescription>
                Analyze and organize your video clips automatically using AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isSorting && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Analyzing clips...</span>
                    <span>{sortingProgress}%</span>
                  </div>
                  <Progress value={sortingProgress} className="w-full" />
                  <p className="text-sm text-muted-foreground">
                    This may take a few minutes depending on the number of clips
                  </p>
                </div>
              )}

              {sortResult && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {sortResult.success ? (
                      <Badge variant="default">Success</Badge>
                    ) : (
                      <Badge variant="destructive">Failed</Badge>
                    )}
                  </div>
                  
                  {sortResult.success && (
                    <div className="p-4 bg-muted rounded-lg space-y-2">
                      <p><strong>Total Clips Analyzed:</strong> {sortResult.totalClips}</p>
                      
                      {sortResult.categories && (
                        <div className="space-y-2">
                          <p><strong>Categories Found:</strong></p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {Object.entries(sortResult.categories).map(([key, count]) => (
                              <div key={key} className="flex justify-between">
                                <span className="capitalize">{key.replace('_', ' ')}</span>
                                <span>{count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {sortResult.error && (
                    <p className="text-sm text-destructive">{sortResult.error}</p>
                  )}
                </div>
              )}

              <Button 
                onClick={handleSortClips}
                disabled={isSorting}
                className="w-full"
              >
                {isSorting ? 'Sorting Clips...' : 'Start Sorting'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="niches" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                Browse by Niche
              </CardTitle>
              <CardDescription>Explore clips organized by content niche</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {niches.map((niche: string) => (
                  <Button
                    key={niche}
                    variant={selectedNiche === niche ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSelectedNiche(niche);
                      refetchNicheClips();
                    }}
                    className="justify-start"
                  >
                    <span className="capitalize">{niche}</span>
                  </Button>
                ))}
              </div>

              {selectedNiche && nicheClips?.clips && (
                <div className="space-y-3">
                  <h3 className="font-semibold capitalize">
                    {selectedNiche} Clips ({nicheClips.clips.length})
                  </h3>
                  <div className="grid gap-3">
                    {nicheClips.clips.map((clip: ClipMetadata) => (
                      <Card key={clip.id} className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{clip.filename}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getNicheColor(clip.niche)} variant="outline">
                                {clip.niche}
                              </Badge>
                              <Badge className={getEmotionColor(clip.emotion)} variant="outline">
                                {clip.emotion}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {Math.round(clip.confidence * 100)}% confidence
                              </span>
                            </div>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            <p>{formatFileSize(clip.size)}</p>
                            {clip.duration && <p>{clip.duration.toFixed(1)}s</p>}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emotions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Browse by Emotion
              </CardTitle>
              <CardDescription>Explore clips organized by emotional tone</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {emotions.map((emotion: string) => (
                  <Button
                    key={emotion}
                    variant={selectedEmotion === emotion ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSelectedEmotion(emotion);
                      refetchEmotionClips();
                    }}
                    className="justify-start"
                  >
                    <span className="capitalize">{emotion}</span>
                  </Button>
                ))}
              </div>

              {selectedEmotion && emotionClips?.clips && (
                <div className="space-y-3">
                  <h3 className="font-semibold capitalize">
                    {selectedEmotion} Clips ({emotionClips.clips.length})
                  </h3>
                  <div className="grid gap-3">
                    {emotionClips.clips.map((clip: ClipMetadata) => (
                      <Card key={clip.id} className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{clip.filename}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getNicheColor(clip.niche)} variant="outline">
                                {clip.niche}
                              </Badge>
                              <Badge className={getEmotionColor(clip.emotion)} variant="outline">
                                {clip.emotion}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {Math.round(clip.confidence * 100)}% confidence
                              </span>
                            </div>
                            {clip.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {clip.tags.slice(0, 3).map(tag => (
                                  <span key={tag} className="text-xs bg-muted px-1 rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            <p>{formatFileSize(clip.size)}</p>
                            {clip.duration && <p>{clip.duration.toFixed(1)}s</p>}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Sorting Results
              </CardTitle>
              <CardDescription>View detailed analysis results and statistics</CardDescription>
            </CardHeader>
            <CardContent>
              {sortResult ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Analysis Status:</span>
                    <Badge variant={sortResult.success ? "default" : "destructive"}>
                      {sortResult.success ? "Complete" : "Failed"}
                    </Badge>
                  </div>
                  
                  {sortResult.success && sortResult.sortedClips && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="p-3">
                          <div className="text-center">
                            <div className="text-2xl font-bold">{sortResult.totalClips}</div>
                            <div className="text-sm text-muted-foreground">Total Clips</div>
                          </div>
                        </Card>
                        <Card className="p-3">
                          <div className="text-center">
                            <div className="text-2xl font-bold">{niches.length}</div>
                            <div className="text-sm text-muted-foreground">Niches Found</div>
                          </div>
                        </Card>
                        <Card className="p-3">
                          <div className="text-center">
                            <div className="text-2xl font-bold">{emotions.length}</div>
                            <div className="text-sm text-muted-foreground">Emotions Found</div>
                          </div>
                        </Card>
                        <Card className="p-3">
                          <div className="text-center">
                            <div className="text-2xl font-bold">
                              {Math.round(sortResult.sortedClips.reduce((sum, clip) => sum + clip.confidence, 0) / sortResult.sortedClips.length * 100)}%
                            </div>
                            <div className="text-sm text-muted-foreground">Avg Confidence</div>
                          </div>
                        </Card>
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-semibold">Top Performing Clips</h3>
                        <div className="grid gap-2">
                          {sortResult.sortedClips
                            .filter(clip => clip.confidence > 0.7)
                            .slice(0, 5)
                            .map((clip) => (
                            <Card key={clip.id} className="p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{clip.filename}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge className={getNicheColor(clip.niche)} variant="outline">
                                      {clip.niche}
                                    </Badge>
                                    <Badge className={getEmotionColor(clip.emotion)} variant="outline">
                                      {clip.emotion}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-medium text-green-600">
                                    {Math.round(clip.confidence * 100)}%
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {formatFileSize(clip.size)}
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {sortResult.error && (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-destructive">{sortResult.error}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No analysis results yet. Run clip sorting to see results here.
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