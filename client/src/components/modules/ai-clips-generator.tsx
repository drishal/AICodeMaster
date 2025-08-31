import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import ScrollableCard from "@/components/ui/scrollable-card";
import { 
  Wand2,
  Video,
  Image as ImageIcon,
  Mic,
  Music,
  Play,
  Pause,
  Square,
  Download,
  Upload,
  Sparkles,
  Palette,
  Volume2,
  Settings,
  Zap,
  Film,
  Camera,
  Headphones,
  RotateCcw,
  Share2,
  Star,
  Clock,
  Layers,
  Brush,
  Type,
  Sliders
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface GenerationProject {
  id: string;
  name: string;
  type: "video" | "image" | "audio" | "voice";
  status: "generating" | "completed" | "failed";
  prompt: string;
  settings: any;
  output?: string;
  duration?: number;
  createdAt: string;
}

interface VoiceSettings {
  language: string;
  gender: "male" | "female" | "neutral";
  speed: number;
  pitch: number;
  emotion: string;
  accent: string;
}

interface VideoSettings {
  duration: number;
  style: string;
  resolution: string;
  fps: number;
  aspect_ratio: string;
  background_music: boolean;
}

interface ImageSettings {
  style: string;
  resolution: string;
  aspect_ratio: string;
  color_scheme: string;
  quality: "standard" | "hd" | "4k";
}

export function AiClipsGenerator() {
  const [activeTab, setActiveTab] = useState("video");
  const [prompt, setPrompt] = useState("");
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Voice settings
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    language: "en-US",
    gender: "female",
    speed: 1.0,
    pitch: 1.0,
    emotion: "neutral",
    accent: "american"
  });

  // Video settings
  const [videoSettings, setVideoSettings] = useState<VideoSettings>({
    duration: 30,
    style: "modern",
    resolution: "1080p",
    fps: 30,
    aspect_ratio: "16:9",
    background_music: true
  });

  // Image settings
  const [imageSettings, setImageSettings] = useState<ImageSettings>({
    style: "photorealistic",
    resolution: "1024x1024",
    aspect_ratio: "1:1",
    color_scheme: "vibrant",
    quality: "hd"
  });

  // Mock projects data
  const mockProjects: GenerationProject[] = [
    {
      id: "1",
      name: "Mobile App Demo Video",
      type: "video",
      status: "completed",
      prompt: "Create a modern app demo showcasing MO development features",
      settings: videoSettings,
      output: "https://example.com/video1.mp4",
      duration: 45,
      createdAt: "2 hours ago"
    },
    {
      id: "2", 
      name: "AI Voice Narration",
      type: "voice",
      status: "completed",
      prompt: "Professional narration for marketing video",
      settings: voiceSettings,
      output: "https://example.com/voice1.mp3",
      duration: 30,
      createdAt: "1 hour ago"
    },
    {
      id: "3",
      name: "Product Feature Image",
      type: "image", 
      status: "generating",
      prompt: "Sleek mobile development workspace with coding interface",
      settings: imageSettings,
      createdAt: "10 minutes ago"
    }
  ];

  const generateContent = useMutation({
    mutationFn: async (data: {
      type: string;
      prompt: string;
      settings: any;
    }) => {
      setIsGenerating(true);
      
      // Simulate generation process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      return {
        success: true,
        projectId: Math.random().toString(36).substr(2, 9),
        message: `${data.type} generation started`,
        estimatedTime: data.type === 'video' ? '2-3 minutes' : '30-60 seconds'
      };
    },
    onSuccess: (data) => {
      setIsGenerating(false);
      toast({
        title: "Generation Started",
        description: `Your ${activeTab} is being created. Estimated time: ${data.estimatedTime}`,
      });
      setPrompt("");
    },
    onError: () => {
      setIsGenerating(false);
      toast({
        title: "Generation Failed",
        description: "Please try again with a different prompt.",
        variant: "destructive"
      });
    }
  });

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a description for what you want to create.",
        variant: "destructive"
      });
      return;
    }

    let settings;
    switch (activeTab) {
      case "video":
        settings = videoSettings;
        break;
      case "voice":
        settings = voiceSettings;
        break;
      case "image":
        settings = imageSettings;
        break;
      default:
        settings = {};
    }

    generateContent.mutate({
      type: activeTab,
      prompt,
      settings
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "generating":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "failed":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="w-4 h-4" />;
      case "image": return <ImageIcon className="w-4 h-4" />;
      case "voice": return <Mic className="w-4 h-4" />;
      case "audio": return <Music className="w-4 h-4" />;
      default: return <Wand2 className="w-4 h-4" />;
    }
  };

  return (
    <Card className="bg-surface border-surface-variant module-enhanced">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-pink-400" />
            <span>AI Clips & Media Generator Pro</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-pink-500/10 text-pink-400">Free Forever</Badge>
            <Badge className="bg-green-500/10 text-green-400">Open Source</Badge>
          </div>
        </CardTitle>
        <div className="card-description">
          Advanced media generation with AI video creation, voice synthesis, image generation, 
          batch processing, style transfer, background removal, and viral optimization features.
        </div>
        <div className="feature-list">
          <div className="feature-tag">AI Video</div>
          <div className="feature-tag">Voice Synthesis</div>
          <div className="feature-tag">Image Generation</div>
          <div className="feature-tag">Batch Process</div>
          <div className="feature-tag">Style Transfer</div>
          <div className="feature-tag">Background Remove</div>
          <div className="feature-tag">Viral Optimizer</div>
          <div className="feature-tag">Quality Enhance</div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollableCard>
          <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full internal-tabs-container">
          <TabsList className="grid w-full grid-cols-4 bg-surface-variant tabs-list">
            <TabsTrigger value="video" className="text-xs">
              <Video className="w-3 h-3 mr-1" />
              Video
            </TabsTrigger>
            <TabsTrigger value="image" className="text-xs">
              <ImageIcon className="w-3 h-3 mr-1" />
              Image
            </TabsTrigger>
            <TabsTrigger value="voice" className="text-xs">
              <Mic className="w-3 h-3 mr-1" />
              Voice
            </TabsTrigger>
            <TabsTrigger value="audio" className="text-xs">
              <Music className="w-3 h-3 mr-1" />
              Audio
            </TabsTrigger>
          </TabsList>

            <TabsContent value="video" className="space-y-4 tabs-content">
              <div className="bg-surface-variant rounded-lg p-4">
              <h4 className="text-sm font-medium mb-3">AI Video Generation</h4>
              <div className="space-y-3">
                <Textarea
                  placeholder="Describe your video: 'Create a modern app demo showing mobile development features with smooth transitions and professional narration'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="bg-dark border-surface-variant"
                  rows={3}
                />
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-text-secondary mb-1 block">Duration</label>
                    <Select value={videoSettings.duration.toString()} onValueChange={(v) => setVideoSettings({...videoSettings, duration: parseInt(v)})}>
                      <SelectTrigger className="bg-dark border-surface-variant">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 seconds</SelectItem>
                        <SelectItem value="30">30 seconds</SelectItem>
                        <SelectItem value="60">1 minute</SelectItem>
                        <SelectItem value="120">2 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-xs text-text-secondary mb-1 block">Style</label>
                    <Select value={videoSettings.style} onValueChange={(v) => setVideoSettings({...videoSettings, style: v})}>
                      <SelectTrigger className="bg-dark border-surface-variant">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="cinematic">Cinematic</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="corporate">Corporate</SelectItem>
                        <SelectItem value="creative">Creative</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-xs text-text-secondary mb-1 block">Quality</label>
                    <Select value={videoSettings.resolution} onValueChange={(v) => setVideoSettings({...videoSettings, resolution: v})}>
                      <SelectTrigger className="bg-dark border-surface-variant">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="720p">HD (720p)</SelectItem>
                        <SelectItem value="1080p">Full HD (1080p)</SelectItem>
                        <SelectItem value="4k">4K Ultra HD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-xs text-text-secondary">Background Music</label>
                  <Button
                    size="sm"
                    variant={videoSettings.background_music ? "default" : "outline"}
                    onClick={() => setVideoSettings({...videoSettings, background_music: !videoSettings.background_music})}
                    className="text-xs"
                  >
                    {videoSettings.background_music ? "On" : "Off"}
                  </Button>
                </div>
              </div>
            </div>
            </TabsContent>

            <TabsContent value="image" className="space-y-4 tabs-content">
              <div className="bg-surface-variant rounded-lg p-4">
              <h4 className="text-sm font-medium mb-3">AI Image Generation</h4>
              <div className="space-y-3">
                <Textarea
                  placeholder="Describe your image: 'Professional mobile developer workspace with multiple screens showing code, modern lighting, minimalist design'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="bg-dark border-surface-variant"
                  rows={3}
                />
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-text-secondary mb-1 block">Style</label>
                    <Select value={imageSettings.style} onValueChange={(v) => setImageSettings({...imageSettings, style: v})}>
                      <SelectTrigger className="bg-dark border-surface-variant">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="photorealistic">Photorealistic</SelectItem>
                        <SelectItem value="digital_art">Digital Art</SelectItem>
                        <SelectItem value="illustration">Illustration</SelectItem>
                        <SelectItem value="concept_art">Concept Art</SelectItem>
                        <SelectItem value="minimalist">Minimalist</SelectItem>
                        <SelectItem value="abstract">Abstract</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-xs text-text-secondary mb-1 block">Aspect Ratio</label>
                    <Select value={imageSettings.aspect_ratio} onValueChange={(v) => setImageSettings({...imageSettings, aspect_ratio: v})}>
                      <SelectTrigger className="bg-dark border-surface-variant">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1:1">Square (1:1)</SelectItem>
                        <SelectItem value="16:9">Widescreen (16:9)</SelectItem>
                        <SelectItem value="4:3">Standard (4:3)</SelectItem>
                        <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-xs text-text-secondary mb-1 block">Quality</label>
                    <Select value={imageSettings.quality} onValueChange={(v) => setImageSettings({...imageSettings, quality: v as any})}>
                      <SelectTrigger className="bg-dark border-surface-variant">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="hd">HD</SelectItem>
                        <SelectItem value="4k">4K Ultra</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            </TabsContent>

            <TabsContent value="voice" className="space-y-4 tabs-content">
              <div className="bg-surface-variant rounded-lg p-4">
              <h4 className="text-sm font-medium mb-3">AI Voice Generation</h4>
              <div className="space-y-3">
                <Textarea
                  placeholder="Enter text to convert to speech: 'Welcome to MO App Development, your AI-powered mobile development platform...'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="bg-dark border-surface-variant"
                  rows={4}
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-text-secondary mb-1 block">Language</label>
                    <Select value={voiceSettings.language} onValueChange={(v) => setVoiceSettings({...voiceSettings, language: v})}>
                      <SelectTrigger className="bg-dark border-surface-variant">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="en-GB">English (UK)</SelectItem>
                        <SelectItem value="es-ES">Spanish</SelectItem>
                        <SelectItem value="fr-FR">French</SelectItem>
                        <SelectItem value="de-DE">German</SelectItem>
                        <SelectItem value="it-IT">Italian</SelectItem>
                        <SelectItem value="ja-JP">Japanese</SelectItem>
                        <SelectItem value="zh-CN">Chinese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-xs text-text-secondary mb-1 block">Gender</label>
                    <Select value={voiceSettings.gender} onValueChange={(v) => setVoiceSettings({...voiceSettings, gender: v as any})}>
                      <SelectTrigger className="bg-dark border-surface-variant">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-text-secondary mb-1 block">Speed: {voiceSettings.speed.toFixed(1)}x</label>
                    <Slider
                      value={[voiceSettings.speed]}
                      onValueChange={([v]) => setVoiceSettings({...voiceSettings, speed: v})}
                      min={0.5}
                      max={2.0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-text-secondary mb-1 block">Pitch: {voiceSettings.pitch.toFixed(1)}</label>
                    <Slider
                      value={[voiceSettings.pitch]}
                      onValueChange={([v]) => setVoiceSettings({...voiceSettings, pitch: v})}
                      min={0.5}
                      max={2.0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-text-secondary mb-1 block">Emotion</label>
                  <Select value={voiceSettings.emotion} onValueChange={(v) => setVoiceSettings({...voiceSettings, emotion: v})}>
                    <SelectTrigger className="bg-dark border-surface-variant">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="happy">Happy</SelectItem>
                      <SelectItem value="excited">Excited</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="calm">Calm</SelectItem>
                      <SelectItem value="energetic">Energetic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            </TabsContent>

            <TabsContent value="audio" className="space-y-4 tabs-content">
              <div className="bg-surface-variant rounded-lg p-4">
              <h4 className="text-sm font-medium mb-3">AI Music & Audio Generation</h4>
              <div className="space-y-3">
                <Textarea
                  placeholder="Describe the audio: 'Upbeat electronic background music for app demo, modern synthesizers, 120 BPM'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="bg-dark border-surface-variant"
                  rows={3}
                />
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-text-secondary mb-1 block">Genre</label>
                    <Select>
                      <SelectTrigger className="bg-dark border-surface-variant">
                        <SelectValue placeholder="Select genre" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electronic">Electronic</SelectItem>
                        <SelectItem value="ambient">Ambient</SelectItem>
                        <SelectItem value="corporate">Corporate</SelectItem>
                        <SelectItem value="cinematic">Cinematic</SelectItem>
                        <SelectItem value="upbeat">Upbeat</SelectItem>
                        <SelectItem value="chill">Chill</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-xs text-text-secondary mb-1 block">Duration</label>
                    <Select>
                      <SelectTrigger className="bg-dark border-surface-variant">
                        <SelectValue placeholder="Duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 seconds</SelectItem>
                        <SelectItem value="60">1 minute</SelectItem>
                        <SelectItem value="120">2 minutes</SelectItem>
                        <SelectItem value="300">5 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-xs text-text-secondary mb-1 block">Tempo</label>
                    <Select>
                      <SelectTrigger className="bg-dark border-surface-variant">
                        <SelectValue placeholder="BPM" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="60">Slow (60 BPM)</SelectItem>
                        <SelectItem value="90">Medium (90 BPM)</SelectItem>
                        <SelectItem value="120">Fast (120 BPM)</SelectItem>
                        <SelectItem value="140">Very Fast (140 BPM)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            </TabsContent>
            </Tabs>

            <div className="flex items-center space-x-2">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="bg-pink-500 hover:bg-pink-600 flex-1"
          >
            {isGenerating ? (
              <>
                <Zap className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate {activeTab}
              </>
            )}
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4" />
          </Button>
        </div>

        {/* Recent Projects */}
        <div className="bg-surface-variant rounded-lg p-4">
          <h4 className="text-sm font-medium mb-3">Recent Generations</h4>
          <div className="space-y-2">
            {mockProjects.map((project) => (
              <div key={project.id} className="bg-dark rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-8 h-8 bg-surface-variant rounded-lg flex items-center justify-center">
                    {getTypeIcon(project.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium truncate">{project.name}</span>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-text-secondary truncate">{project.prompt}</p>
                    <div className="flex items-center space-x-2 text-xs text-text-secondary mt-1">
                      <Clock className="w-3 h-3" />
                      <span>{project.createdAt}</span>
                      {project.duration && (
                        <>
                          <span>•</span>
                          <span>{project.duration}s</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {project.status === "completed" && (
                    <>
                      <Button size="sm" variant="outline" className="text-xs">
                        <Play className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs">
                        <Download className="w-3 h-3" />
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="outline" className="text-xs">
                    <Share2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Free Tools Notice */}
        <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Star className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-green-400">Free AI Media Generation</span>
          </div>
          <p className="text-xs text-text-secondary">
            Powered by open-source AI models: Stable Diffusion (images), MusicGen (audio), 
            Whisper (voice), and MoviePy (video). No subscription fees, unlimited generations.
          </p>
            </div>
          </div>
        </ScrollableCard>
      </CardContent>
    </Card>
  );
}