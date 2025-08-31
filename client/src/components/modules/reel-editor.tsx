import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Video, 
  Play, 
  Download, 
  Settings, 
  Mic, 
  Type, 
  Music, 
  Palette, 
  Zap,
  Sparkles,
  Film,
  Edit3,
  Clock,
  Volume2,
  Eye,
  Trash2,
  Plus,
  FileVideo,
  Wand2
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ReelProject {
  id: string;
  title: string;
  description: string;
  script: string;
  style: 'modern' | 'tech' | 'educational' | 'business' | 'cinematic';
  duration: number;
  aspectRatio: '9:16' | '1:1' | '16:9';
  voiceSettings: {
    language: string;
    speed: number;
    pitch: number;
    voice: string;
    provider: 'gTTS' | 'pyttsx3' | 'elevenlabs';
    elevenlabsVoiceId?: string;
    emotion?: 'neutral' | 'happy' | 'sad' | 'excited' | 'calm';
  };
  captionSettings: {
    enabled: boolean;
    style: 'minimal' | 'bold' | 'creative' | 'professional';
    position: 'bottom' | 'center' | 'top';
    fontSize: number;
    color: string;
  };
  musicSettings: {
    enabled: boolean;
    genre: string;
    volume: number;
  };
  transitions: string[];
  effects: string[];
  createdAt: string;
  status: 'draft' | 'processing' | 'completed' | 'error';
  outputPath?: string;
  progress?: number;
  scenes?: Array<{
    timestamp: string;
    text: string;
    visual_description: string;
    caption_text: string;
    transition: string;
  }>;
  hook?: string;
  call_to_action?: string;
  hashtags?: string[];
}

interface Template {
  id: string;
  name: string;
  style: string;
  description: string;
  defaultSettings: any;
}

export default function ReelEditor() {
  const [activeTab, setActiveTab] = useState("create");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [projectForm, setProjectForm] = useState({
    title: "",
    topic: "",
    description: "",
    script: "",
    style: "modern" as const,
    duration: 15,
    aspectRatio: "9:16" as const,
    voiceSettings: {
      language: "en",
      speed: 1.0,
      pitch: 0,
      voice: "neutral",
      provider: "gTTS" as const,
      emotion: "neutral" as const
    },
    captionSettings: {
      enabled: true,
      style: "minimal" as const,
      position: "bottom" as const,
      fontSize: 48,
      color: "white"
    },
    musicSettings: {
      enabled: true,
      genre: "ambient",
      volume: 0.3
    }
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch projects
  const { data: projects = [], isLoading: projectsLoading } = useQuery<ReelProject[]>({
    queryKey: ['/api/reel-editor/projects'],
    refetchInterval: 2000 // Refresh every 2 seconds to update progress
  });

  // Fetch templates
  const { data: templates = [] } = useQuery<Template[]>({
    queryKey: ['/api/reel-editor/templates']
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: typeof projectForm) => {
      const response = await fetch('/api/reel-editor/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/reel-editor/projects'] });
      setActiveTab("projects");
      toast({ title: "Project created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to create project", description: error.message, variant: "destructive" });
    }
  });

  // Generate reel mutation
  const generateReelMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await fetch('/api/reel-editor/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reel-editor/projects'] });
      toast({ title: "Reel generation started" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to generate reel", description: error.message, variant: "destructive" });
    }
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await fetch(`/api/reel-editor/projects/${projectId}`, {
        method: 'DELETE'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reel-editor/projects'] });
      toast({ title: "Project deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete project", description: error.message, variant: "destructive" });
    }
  });

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setProjectForm({
      ...projectForm,
      style: template.style as any,
      duration: template.defaultSettings.duration,
      aspectRatio: template.defaultSettings.aspectRatio,
      voiceSettings: template.defaultSettings.voiceSettings,
      captionSettings: template.defaultSettings.captionSettings,
      musicSettings: template.defaultSettings.musicSettings
    });
  };

  const handleCreateProject = () => {
    if (!projectForm.title || !projectForm.topic) {
      toast({ title: "Please fill in title and topic", variant: "destructive" });
      return;
    }
    createProjectMutation.mutate(projectForm);
  };

  // Smart script generation mutation
  const generateSmartScriptMutation = useMutation({
    mutationFn: async (data: { topic: string; style: string; duration: number; voiceProvider: string }) => {
      const response = await fetch('/api/reel-editor/smart-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setProjectForm(prev => ({
          ...prev,
          script: data.script,
          description: data.voiceNotes || prev.description
        }));
        toast({
          title: "Smart Script Generated",
          description: `Optimized for ${projectForm.voiceSettings.provider} voice synthesis`
        });
      }
    },
    onError: (error: any) => {
      toast({ title: "Failed to generate smart script", description: error.message, variant: "destructive" });
    }
  });

  // Voice synthesis mutation
  const synthesizeVoiceMutation = useMutation({
    mutationFn: async (data: { text: string; voiceSettings: any }) => {
      const response = await fetch('/api/reel-editor/synthesize-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Voice Synthesized Successfully",
          description: `Audio generated using ${projectForm.voiceSettings.provider}`
        });
      }
    },
    onError: (error: any) => {
      toast({ title: "Voice synthesis failed", description: error.message, variant: "destructive" });
    }
  });

  const handleGenerateSmartScript = () => {
    if (!projectForm.topic) {
      toast({ title: "Please enter a topic first", variant: "destructive" });
      return;
    }
    generateSmartScriptMutation.mutate({
      topic: projectForm.topic,
      style: projectForm.style,
      duration: projectForm.duration,
      voiceProvider: projectForm.voiceSettings.provider
    });
  };

  const handleSynthesizeVoice = () => {
    if (!projectForm.script) {
      toast({ title: "Please generate a script first", variant: "destructive" });
      return;
    }
    synthesizeVoiceMutation.mutate({
      text: projectForm.script,
      voiceSettings: projectForm.voiceSettings
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'processing': return 'bg-blue-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <Video className="w-4 h-4" />;
      case 'processing': return <Sparkles className="w-4 h-4 animate-spin" />;
      case 'error': return <Zap className="w-4 h-4" />;
      default: return <Edit3 className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI-Powered Reel Editor</h2>
          <p className="text-muted-foreground">
            Create professional reels with AI-generated scripts, voice narration, and visual effects
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Film className="w-3 h-3" />
            MoviePy + OpenCV
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Wand2 className="w-3 h-3" />
            AI Enhanced
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Create New Reel</TabsTrigger>
          <TabsTrigger value="projects">My Projects</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Project Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Project Settings
                </CardTitle>
                <CardDescription>Configure your reel project details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Project Title</Label>
                  <Input
                    id="title"
                    placeholder="My Amazing Reel"
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({...projectForm, title: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic">Topic/Theme</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Mobile app development, Digital marketing"
                    value={projectForm.topic}
                    onChange={(e) => setProjectForm({...projectForm, topic: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Style</Label>
                    <Select value={projectForm.style} onValueChange={(value: any) => setProjectForm({...projectForm, style: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="tech">Tech</SelectItem>
                        <SelectItem value="educational">Educational</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="cinematic">Cinematic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Aspect Ratio</Label>
                    <Select value={projectForm.aspectRatio} onValueChange={(value: any) => setProjectForm({...projectForm, aspectRatio: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="9:16">9:16 (Stories)</SelectItem>
                        <SelectItem value="1:1">1:1 (Square)</SelectItem>
                        <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Duration: {projectForm.duration}s</Label>
                  <Slider
                    value={[projectForm.duration]}
                    onValueChange={([value]) => setProjectForm({...projectForm, duration: value})}
                    min={10}
                    max={60}
                    step={5}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Voice Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="w-5 h-5" />
                  Voice Settings
                </CardTitle>
                <CardDescription>Configure AI voice narration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4" />
                    <span className="text-sm font-medium">Smart Voice Synthesis</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSynthesizeVoice}
                    disabled={synthesizeVoiceMutation.isPending || !projectForm.script}
                  >
                    {synthesizeVoiceMutation.isPending ? (
                      <>
                        <Volume2 className="w-3 h-3 mr-1 animate-pulse" />
                        Synthesizing...
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3 h-3 mr-1" />
                        Generate Voice
                      </>
                    )}
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label>Voice Provider</Label>
                    <Select 
                      value={projectForm.voiceSettings.provider} 
                      onValueChange={(value) => setProjectForm({
                        ...projectForm, 
                        voiceSettings: {...projectForm.voiceSettings, provider: value as any}
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gTTS">gTTS (Free)</SelectItem>
                        <SelectItem value="pyttsx3">pyttsx3 (Offline)</SelectItem>
                        <SelectItem value="elevenlabs">ElevenLabs (Premium)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select 
                      value={projectForm.voiceSettings.language} 
                      onValueChange={(value) => setProjectForm({
                        ...projectForm, 
                        voiceSettings: {...projectForm.voiceSettings, language: value}
                      })}
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
                        <SelectItem value="hi">Hindi</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                        <SelectItem value="ko">Korean</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Emotion</Label>
                    <Select 
                      value={projectForm.voiceSettings.emotion} 
                      onValueChange={(value) => setProjectForm({
                        ...projectForm, 
                        voiceSettings: {...projectForm.voiceSettings, emotion: value as any}
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="neutral">Neutral</SelectItem>
                        <SelectItem value="happy">Happy</SelectItem>
                        <SelectItem value="excited">Excited</SelectItem>
                        <SelectItem value="calm">Calm</SelectItem>
                        <SelectItem value="sad">Sad</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Speed: {projectForm.voiceSettings.speed.toFixed(1)}x</Label>
                  <Slider
                    value={[projectForm.voiceSettings.speed]}
                    onValueChange={([value]) => setProjectForm({
                      ...projectForm, 
                      voiceSettings: {...projectForm.voiceSettings, speed: value}
                    })}
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Pitch: {projectForm.voiceSettings.pitch > 0 ? '+' : ''}{projectForm.voiceSettings.pitch}</Label>
                  <Slider
                    value={[projectForm.voiceSettings.pitch]}
                    onValueChange={([value]) => setProjectForm({
                      ...projectForm, 
                      voiceSettings: {...projectForm.voiceSettings, pitch: value}
                    })}
                    min={-5}
                    max={5}
                    step={1}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Caption Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="w-5 h-5" />
                  Caption Settings
                </CardTitle>
                <CardDescription>Configure on-screen text and captions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="captions-enabled">Enable Captions</Label>
                  <Switch
                    id="captions-enabled"
                    checked={projectForm.captionSettings.enabled}
                    onCheckedChange={(checked) => setProjectForm({
                      ...projectForm,
                      captionSettings: {...projectForm.captionSettings, enabled: checked}
                    })}
                  />
                </div>

                {projectForm.captionSettings.enabled && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Style</Label>
                        <Select 
                          value={projectForm.captionSettings.style} 
                          onValueChange={(value: any) => setProjectForm({
                            ...projectForm, 
                            captionSettings: {...projectForm.captionSettings, style: value}
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="minimal">Minimal</SelectItem>
                            <SelectItem value="bold">Bold</SelectItem>
                            <SelectItem value="creative">Creative</SelectItem>
                            <SelectItem value="professional">Professional</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Position</Label>
                        <Select 
                          value={projectForm.captionSettings.position} 
                          onValueChange={(value: any) => setProjectForm({
                            ...projectForm, 
                            captionSettings: {...projectForm.captionSettings, position: value}
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="top">Top</SelectItem>
                            <SelectItem value="center">Center</SelectItem>
                            <SelectItem value="bottom">Bottom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Font Size: {projectForm.captionSettings.fontSize}px</Label>
                      <Slider
                        value={[projectForm.captionSettings.fontSize]}
                        onValueChange={([value]) => setProjectForm({
                          ...projectForm, 
                          captionSettings: {...projectForm.captionSettings, fontSize: value}
                        })}
                        min={24}
                        max={72}
                        step={4}
                        className="w-full"
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Music Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="w-5 h-5" />
                  Music Settings
                </CardTitle>
                <CardDescription>Configure background music and audio</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="music-enabled">Enable Background Music</Label>
                  <Switch
                    id="music-enabled"
                    checked={projectForm.musicSettings.enabled}
                    onCheckedChange={(checked) => setProjectForm({
                      ...projectForm,
                      musicSettings: {...projectForm.musicSettings, enabled: checked}
                    })}
                  />
                </div>

                {projectForm.musicSettings.enabled && (
                  <>
                    <div className="space-y-2">
                      <Label>Genre</Label>
                      <Select 
                        value={projectForm.musicSettings.genre} 
                        onValueChange={(value) => setProjectForm({
                          ...projectForm, 
                          musicSettings: {...projectForm.musicSettings, genre: value}
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ambient">Ambient</SelectItem>
                          <SelectItem value="corporate">Corporate</SelectItem>
                          <SelectItem value="cinematic">Cinematic</SelectItem>
                          <SelectItem value="upbeat">Upbeat</SelectItem>
                          <SelectItem value="minimal">Minimal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Volume: {Math.round(projectForm.musicSettings.volume * 100)}%</Label>
                      <Slider
                        value={[projectForm.musicSettings.volume]}
                        onValueChange={([value]) => setProjectForm({
                          ...projectForm, 
                          musicSettings: {...projectForm.musicSettings, volume: value}
                        })}
                        min={0}
                        max={1}
                        step={0.1}
                        className="w-full"
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Create Button */}
          <div className="flex justify-center">
            <Button 
              onClick={handleCreateProject}
              disabled={createProjectMutation.isPending}
              size="lg"
              className="px-8"
            >
              {createProjectMutation.isPending ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Creating Project...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Reel Project
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          {/* Projects Grid */}
          {projectsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Sparkles className="w-6 h-6 animate-spin mr-2" />
              Loading projects...
            </div>
          ) : projects.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileVideo className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first AI-powered reel project to get started
                </p>
                <Button onClick={() => setActiveTab("create")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Project
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project: ReelProject) => (
                <Card key={project.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                      <Badge 
                        variant="secondary" 
                        className={`${getStatusColor(project.status)} text-white`}
                      >
                        {getStatusIcon(project.status)}
                        <span className="ml-1 capitalize">{project.status}</span>
                      </Badge>
                    </div>
                    <CardDescription>{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {project.duration}s
                      </span>
                      <span className="flex items-center gap-1">
                        <Settings className="w-3 h-3" />
                        {project.aspectRatio}
                      </span>
                      <Badge variant="outline" className="text-xs capitalize">
                        {project.style}
                      </Badge>
                    </div>

                    {project.status === 'processing' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span>{project.progress || 0}%</span>
                        </div>
                        <Progress value={project.progress || 0} className="w-full" />
                      </div>
                    )}

                    {project.scenes && project.scenes.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Scenes Generated</h4>
                        <div className="space-y-1">
                          {project.scenes.slice(0, 2).map((scene, idx) => (
                            <div key={idx} className="text-xs text-muted-foreground p-2 bg-muted rounded">
                              <span className="font-medium">{scene.timestamp}:</span> {scene.caption_text}
                            </div>
                          ))}
                          {project.scenes.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{project.scenes.length - 2} more scenes
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {project.hashtags && project.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {project.hashtags.slice(0, 3).map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      {project.status === 'draft' && (
                        <Button 
                          size="sm" 
                          onClick={() => generateReelMutation.mutate(project.id)}
                          disabled={generateReelMutation.isPending}
                          className="flex-1"
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Generate
                        </Button>
                      )}
                      
                      {project.status === 'completed' && project.outputPath && (
                        <Button size="sm" variant="outline" className="flex-1">
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                      )}
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => deleteProjectMutation.mutate(project.id)}
                        disabled={deleteProjectMutation.isPending}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map((template: Template) => (
              <Card 
                key={template.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleTemplateSelect(template)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="w-5 h-5" />
                      {template.name}
                    </CardTitle>
                    <Badge variant="outline" className="capitalize">
                      {template.style}
                    </Badge>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center">
                      <div className="font-medium">{template.defaultSettings.duration}s</div>
                      <div className="text-xs text-muted-foreground">Duration</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{template.defaultSettings.aspectRatio}</div>
                      <div className="text-xs text-muted-foreground">Ratio</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">
                        {template.defaultSettings.captionSettings.enabled ? 'Yes' : 'No'}
                      </div>
                      <div className="text-xs text-muted-foreground">Captions</div>
                    </div>
                  </div>
                  
                  {selectedTemplate?.id === template.id && (
                    <div className="pt-2 border-t">
                      <Button 
                        size="sm" 
                        onClick={() => setActiveTab("create")}
                        className="w-full"
                      >
                        Use This Template
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}