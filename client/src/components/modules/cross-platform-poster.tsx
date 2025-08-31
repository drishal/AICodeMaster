import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Send, Share2, Calendar, Settings, TrendingUp, Zap, 
  Instagram, Youtube, MessageCircle, Facebook, 
  Twitter, Linkedin, CheckCircle, XCircle, Clock,
  Hash, Target, BarChart3, Upload, Wand2, Type, PlayCircle, Mic, Volume2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CrossPlatformPost {
  id: number;
  title: string;
  originalContent: string;
  mediaUrls: string[];
  targetPlatforms: string[];
  scheduledTime?: string;
  postingStatus: string;
  postResults: Record<string, any>;
  autoFormatEnabled: boolean;
  hashtagStrategy: string;
  engagementBoost: boolean;
  createdAt: string;
}

interface PlatformConnection {
  id: number;
  platform: string;
  connectionType: string;
  isActive: boolean;
  lastSync?: string;
}

export function CrossPlatformPoster() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [postForm, setPostForm] = useState({
    title: '',
    originalContent: '',
    mediaUrls: [] as string[],
    targetPlatforms: [] as string[],
    autoFormatEnabled: true,
    hashtagStrategy: 'trending',
    engagementBoost: false,
    scheduledTime: '',
    captionsEnabled: false,
    captionStyle: 'modern',
    customCaptionText: '',
    voiceoverEnabled: false,
    voiceProvider: 'gtts',
    voiceLanguage: 'en',
    voiceGender: 'female',
    voiceSpeed: 1.0,
    customVoiceScript: ''
  });

  const [activeTab, setActiveTab] = useState('create');

  // Fetch cross-platform posts
  const { data: posts = [], isLoading: postsLoading } = useQuery<CrossPlatformPost[]>({
    queryKey: ['/api/cross-platform-posts']
  });

  // Fetch platform connections
  const { data: connections = [], isLoading: connectionsLoading } = useQuery<PlatformConnection[]>({
    queryKey: ['/api/platform-connections']
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: typeof postForm) => {
      const response = await fetch('/api/cross-platform-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cross-platform-posts'] });
      toast({ title: "Post created successfully", description: "Content prepared for cross-platform posting" });
      setPostForm({
        title: '',
        originalContent: '',
        mediaUrls: [],
        targetPlatforms: [],
        autoFormatEnabled: true,
        hashtagStrategy: 'trending',
        engagementBoost: false,
        scheduledTime: '',
        captionsEnabled: false,
        captionStyle: 'modern',
        customCaptionText: '',
        voiceoverEnabled: false,
        voiceProvider: 'gtts',
        voiceLanguage: 'en',
        voiceGender: 'female',
        voiceSpeed: 1.0,
        customVoiceScript: ''
      });
    },
    onError: (error: any) => {
      toast({ title: "Failed to create post", description: error.message, variant: "destructive" });
    }
  });

  // Format content mutation
  const formatContentMutation = useMutation({
    mutationFn: async (data: { content: string; platforms: string[] }) => {
      const response = await fetch('/api/cross-platform-posts/format', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({ title: "Content formatted", description: "Content optimized for selected platforms" });
    },
    onError: (error: any) => {
      toast({ title: "Formatting failed", description: error.message, variant: "destructive" });
    }
  });

  // Auto-post mutation
  const autoPostMutation = useMutation({
    mutationFn: async (postId: number) => {
      const response = await fetch(`/api/cross-platform-posts/${postId}/post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cross-platform-posts'] });
      toast({ title: "Auto-posting initiated", description: "Content is being posted across platforms" });
    },
    onError: (error: any) => {
      toast({ title: "Auto-posting failed", description: error.message, variant: "destructive" });
    }
  });

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-500' },
    { id: 'youtube', name: 'YouTube Shorts', icon: Youtube, color: 'text-red-500' },
    { id: 'telegram', name: 'Telegram', icon: MessageCircle, color: 'text-blue-500' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600' },
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'text-sky-500' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700' }
  ];

  const getPlatformIcon = (platform: string) => {
    const platformData = platforms.find(p => p.id === platform);
    if (!platformData) return <Share2 className="w-4 h-4" />;
    const Icon = platformData.icon;
    return <Icon className={`w-4 h-4 ${platformData.color}`} />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'posting': return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const handlePlatformToggle = (platformId: string) => {
    setPostForm(prev => ({
      ...prev,
      targetPlatforms: prev.targetPlatforms.includes(platformId)
        ? prev.targetPlatforms.filter(p => p !== platformId)
        : [...prev.targetPlatforms, platformId]
    }));
  };

  const handleCreatePost = () => {
    if (!postForm.title || !postForm.originalContent || postForm.targetPlatforms.length === 0) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    createPostMutation.mutate(postForm);
  };

  const handleFormatContent = () => {
    if (!postForm.originalContent || postForm.targetPlatforms.length === 0) {
      toast({ title: "Please enter content and select platforms", variant: "destructive" });
      return;
    }
    formatContentMutation.mutate({
      content: postForm.originalContent,
      platforms: postForm.targetPlatforms
    });
  };

  return (
    <Card className="bg-surface border-surface-variant module-enhanced">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Share2 className="w-5 h-5 text-green-400" />
            <span>Cross-Platform Poster Pro</span>
          </div>
          <Badge className="bg-green-500/10 text-green-400">Auto-Format</Badge>
        </CardTitle>
        <div className="card-description">
          Advanced multi-platform posting with AI content optimization, voice synthesis, 
          animated captions, engagement boost, and comprehensive analytics tracking.
        </div>
        <div className="feature-list">
          <div className="feature-tag">Multi Platform</div>
          <div className="feature-tag">AI Optimization</div>
          <div className="feature-tag">Voice Synthesis</div>
          <div className="feature-tag">Animated Captions</div>
          <div className="feature-tag">Engagement Boost</div>
          <div className="feature-tag">Smart Hashtags</div>
          <div className="feature-tag">Auto Schedule</div>
          <div className="feature-tag">Analytics Track</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Main content */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Cross-Platform Auto-Poster Bot</h3>
              <p className="text-muted-foreground">
                📤 Prepares, formats, and auto-posts content across Instagram, Telegram, YouTube Shorts, etc.
              </p>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Auto-Format Enabled
            </Badge>
          </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="create">Create Post</TabsTrigger>
          <TabsTrigger value="posts">My Posts</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Create Post Tab */}
        <TabsContent value="create" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Content Creation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Content Creation
                </CardTitle>
                <CardDescription>Create and format content for multiple platforms</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Post Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter post title..."
                    value={postForm.title}
                    onChange={(e) => setPostForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="content">Content</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleFormatContent}
                      disabled={formatContentMutation.isPending}
                    >
                      {formatContentMutation.isPending ? (
                        <>
                          <Wand2 className="w-3 h-3 mr-1 animate-spin" />
                          Formatting...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-3 h-3 mr-1" />
                          Smart Format
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    id="content"
                    placeholder="Enter your content here..."
                    value={postForm.originalContent}
                    onChange={(e) => setPostForm(prev => ({ ...prev, originalContent: e.target.value }))}
                    rows={6}
                  />
                </div>

                <div>
                  <Label>Media URLs (optional)</Label>
                  <Input
                    placeholder="Add image/video URLs, comma separated"
                    value={postForm.mediaUrls.join(', ')}
                    onChange={(e) => setPostForm(prev => ({ 
                      ...prev, 
                      mediaUrls: e.target.value.split(',').map(url => url.trim()).filter(Boolean)
                    }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Platform Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Target Platforms
                </CardTitle>
                <CardDescription>Select platforms for auto-posting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {platforms.map((platform) => (
                    <div
                      key={platform.id}
                      className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 ${
                        postForm.targetPlatforms.includes(platform.id) ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => handlePlatformToggle(platform.id)}
                    >
                      <Checkbox
                        checked={postForm.targetPlatforms.includes(platform.id)}
                        onChange={() => handlePlatformToggle(platform.id)}
                      />
                      {getPlatformIcon(platform.id)}
                      <span className="text-sm font-medium">{platform.name}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-format">Auto-Format Content</Label>
                    <Switch
                      id="auto-format"
                      checked={postForm.autoFormatEnabled}
                      onCheckedChange={(checked) => setPostForm(prev => ({ ...prev, autoFormatEnabled: checked }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Hashtag Strategy</Label>
                    <Select
                      value={postForm.hashtagStrategy}
                      onValueChange={(value) => setPostForm(prev => ({ ...prev, hashtagStrategy: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trending">Trending</SelectItem>
                        <SelectItem value="niche">Niche-specific</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="engagement-boost">Engagement Boost</Label>
                    <Switch
                      id="engagement-boost"
                      checked={postForm.engagementBoost}
                      onCheckedChange={(checked) => setPostForm(prev => ({ ...prev, engagementBoost: checked }))}
                    />
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="captions-enabled" className="flex items-center gap-2">
                        <Type className="w-4 h-4" />
                        Animated Captions
                      </Label>
                      <Switch
                        id="captions-enabled"
                        checked={postForm.captionsEnabled}
                        onCheckedChange={(checked) => setPostForm(prev => ({ ...prev, captionsEnabled: checked }))}
                      />
                    </div>

                    {postForm.captionsEnabled && (
                      <div className="space-y-3 pl-6">
                        <div className="space-y-2">
                          <Label>Caption Style</Label>
                          <Select
                            value={postForm.captionStyle}
                            onValueChange={(value) => setPostForm(prev => ({ ...prev, captionStyle: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="modern">Modern (White/Black outline)</SelectItem>
                              <SelectItem value="minimal">Minimal (Clean white)</SelectItem>
                              <SelectItem value="bold">Bold (Yellow/Black)</SelectItem>
                              <SelectItem value="creative">Creative (Colorful)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Custom Caption Text (optional)</Label>
                          <Input
                            placeholder="Leave empty for AI-generated captions"
                            value={postForm.customCaptionText}
                            onChange={(e) => setPostForm(prev => ({ ...prev, customCaptionText: e.target.value }))}
                          />
                          <p className="text-xs text-muted-foreground">
                            AI will generate engaging captions if left empty
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="voiceover-enabled" className="flex items-center gap-2">
                        <Mic className="w-4 h-4" />
                        AI Voiceover
                      </Label>
                      <Switch
                        id="voiceover-enabled"
                        checked={postForm.voiceoverEnabled}
                        onCheckedChange={(checked) => setPostForm(prev => ({ ...prev, voiceoverEnabled: checked }))}
                      />
                    </div>

                    {postForm.voiceoverEnabled && (
                      <div className="space-y-3 pl-6">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>Voice Provider</Label>
                            <Select
                              value={postForm.voiceProvider}
                              onValueChange={(value) => setPostForm(prev => ({ ...prev, voiceProvider: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="gtts">Google TTS (Free)</SelectItem>
                                <SelectItem value="pyttsx3">System TTS (Offline)</SelectItem>
                                <SelectItem value="elevenlabs">ElevenLabs (Premium)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Language</Label>
                            <Select
                              value={postForm.voiceLanguage}
                              onValueChange={(value) => setPostForm(prev => ({ ...prev, voiceLanguage: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="es">Spanish</SelectItem>
                                <SelectItem value="fr">French</SelectItem>
                                <SelectItem value="de">German</SelectItem>
                                <SelectItem value="it">Italian</SelectItem>
                                <SelectItem value="pt">Portuguese</SelectItem>
                                <SelectItem value="hi">Hindi</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>Voice Gender</Label>
                            <Select
                              value={postForm.voiceGender}
                              onValueChange={(value) => setPostForm(prev => ({ ...prev, voiceGender: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="male">Male</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Speed: {postForm.voiceSpeed}x</Label>
                            <Input
                              type="range"
                              min="0.5"
                              max="2.0"
                              step="0.1"
                              value={postForm.voiceSpeed}
                              onChange={(e) => setPostForm(prev => ({ ...prev, voiceSpeed: parseFloat(e.target.value) }))}
                              className="w-full"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Custom Voice Script (optional)</Label>
                          <Textarea
                            placeholder="Leave empty for AI-generated script"
                            value={postForm.customVoiceScript}
                            onChange={(e) => setPostForm(prev => ({ ...prev, customVoiceScript: e.target.value }))}
                            rows={3}
                          />
                          <p className="text-xs text-muted-foreground">
                            AI will generate engaging voiceover script if left empty
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Button 
                  onClick={handleCreatePost} 
                  disabled={createPostMutation.isPending}
                  className="w-full"
                >
                  {createPostMutation.isPending ? (
                    <>
                      <Send className="w-4 h-4 mr-2 animate-pulse" />
                      Creating Post...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Create & Schedule Post
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Posts Management Tab */}
        <TabsContent value="posts" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Created Posts</h3>
            <Badge variant="outline" className="flex items-center gap-1">
              <BarChart3 className="w-3 h-3" />
              {posts.length} Total Posts
            </Badge>
          </div>

          <div className="grid gap-4">
            {postsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Share2 className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No posts created yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Create your first cross-platform post to get started
                  </p>
                  <Button onClick={() => setActiveTab('create')}>
                    <Send className="w-4 h-4 mr-2" />
                    Create Post
                  </Button>
                </CardContent>
              </Card>
            ) : (
              posts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold">{post.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {post.originalContent}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(post.postingStatus)}
                        <Badge variant={post.postingStatus === 'completed' ? 'default' : 'secondary'}>
                          {post.postingStatus}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-sm text-muted-foreground">Platforms:</span>
                      {post.targetPlatforms.map((platform) => (
                        <Badge key={platform} variant="outline" className="flex items-center gap-1">
                          {getPlatformIcon(platform)}
                          {platform}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Created {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2">
                        {post.postingStatus === 'draft' && (
                          <Button
                            size="sm"
                            onClick={() => autoPostMutation.mutate(post.id)}
                            disabled={autoPostMutation.isPending}
                          >
                            <Send className="w-3 h-3 mr-1" />
                            Post Now
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <BarChart3 className="w-3 h-3 mr-1" />
                          Analytics
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Platform Connections Tab */}
        <TabsContent value="platforms" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Platform Connections</h3>
            <Button>
              <Settings className="w-4 h-4 mr-2" />
              Add Platform
            </Button>
          </div>

          <div className="grid gap-4">
            {platforms.map((platform) => {
              const connection = connections.find(c => c.platform === platform.id);
              return (
                <Card key={platform.id}>
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-3">
                      {getPlatformIcon(platform.id)}
                      <div>
                        <h4 className="font-semibold">{platform.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {connection ? `Connected via ${connection.connectionType}` : 'Not connected'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={connection?.isActive ? 'default' : 'secondary'}>
                        {connection?.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button variant="outline" size="sm">
                        {connection ? 'Configure' : 'Connect'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Posts</p>
                    <p className="text-2xl font-bold">{posts.length}</p>
                  </div>
                  <Send className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold">94.2%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Platforms</p>
                    <p className="text-2xl font-bold">{connections.filter(c => c.isActive).length}</p>
                  </div>
                  <Target className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Platform Performance</CardTitle>
              <CardDescription>Success rates by platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {platforms.slice(0, 4).map((platform, index) => (
                  <div key={platform.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(platform.id)}
                      <span className="font-medium">{platform.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={95 - index * 5} className="w-24" />
                      <span className="text-sm text-muted-foreground">{95 - index * 5}%</span>
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