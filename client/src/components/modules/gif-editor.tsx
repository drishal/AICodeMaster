import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Upload, Image, Sparkles, Download, Play, Settings } from "lucide-react";
import ScrollableCard from "@/components/ui/scrollable-card";

interface GifEditResult {
  success: boolean;
  outputPath?: string;
  error?: string;
  fileSize?: number;
  duration?: number;
  frames?: number;
}

export function GifEditor() {
  const [inputPath, setInputPath] = useState('');
  const [selectedEffect, setSelectedEffect] = useState('');
  const [fps, setFps] = useState(15);
  const [quality, setQuality] = useState<'high' | 'medium' | 'low'>('medium');
  const [duration, setDuration] = useState<number>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [result, setResult] = useState<GifEditResult | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available effects
  const { data: effectsData, isLoading: effectsLoading } = useQuery({
    queryKey: ['/api/gif-editor/effects'],
    queryFn: () => apiRequest('/api/gif-editor/effects')
  });

  const effects = effectsData?.effects || [];

  // GIF editing mutation
  const editGifMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/gif-editor/edit', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    }),
    onSuccess: (data) => {
      setResult(data);
      setIsProcessing(false);
      if (data.success) {
        toast({
          title: "GIF Effect Applied Successfully",
          description: `Created GIF with ${selectedEffect} effect. File size: ${(data.fileSize / 1024 / 1024).toFixed(2)}MB`
        });
      } else {
        toast({
          title: "GIF Processing Failed",
          description: data.error,
          variant: "destructive"
        });
      }
    },
    onError: (error: any) => {
      setIsProcessing(false);
      toast({
        title: "GIF Processing Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleProcessGif = async () => {
    if (!inputPath || !selectedEffect) {
      toast({
        title: "Missing Information",
        description: "Please provide input path and select an effect",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);
    setResult(null);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);

    editGifMutation.mutate({
      effect: selectedEffect,
      inputPath,
      fps,
      quality,
      duration
    });
  };

  const getEffectDescription = (effect: string) => {
    const descriptions: { [key: string]: string } = {
      convert: 'Basic video to GIF conversion',
      fade: 'Smooth fade in/out transitions',
      zoom: 'Dynamic zoom effects',
      blur: 'Gaussian blur filter',
      sepia: 'Vintage sepia tone',
      vintage: 'Classic vintage look with noise',
      glitch: 'Digital glitch distortion',
      neon: 'Bright neon glow effect',
      rainbow: 'Color cycling rainbow effect',
      sketch: 'Hand-drawn sketch style',
      cyberpunk: 'Futuristic cyberpunk aesthetic'
    };
    return descriptions[effect] || 'Apply custom effect';
  };

  const getEffectIcon = (effect: string) => {
    switch (effect) {
      case 'fade':
      case 'zoom':
        return <Play className="w-4 h-4" />;
      case 'blur':
      case 'sepia':
      case 'vintage':
        return <Image className="w-4 h-4" />;
      case 'glitch':
      case 'neon':
      case 'rainbow':
      case 'cyberpunk':
        return <Sparkles className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  return (
    <Card className="bg-surface border-surface-variant module-enhanced">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-pink-400" />
            <span>GIF Editor & Effect Studio Pro</span>
          </div>
          <Badge className="bg-pink-500/10 text-pink-400">11 Effects</Badge>
        </CardTitle>
        <div className="card-description">
          Advanced GIF creation with cinematic effects, custom filters, batch processing, 
          quality optimization, and professional output for social media campaigns.
        </div>
        <div className="feature-list">
          <div className="feature-tag">Cinematic Effects</div>
          <div className="feature-tag">Custom Filters</div>
          <div className="feature-tag">Batch Process</div>
          <div className="feature-tag">Quality Optimize</div>
          <div className="feature-tag">Social Ready</div>
          <div className="feature-tag">Real Time Preview</div>
          <div className="feature-tag">Multiple Formats</div>
          <div className="feature-tag">Cloud Export</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Main content */}
          <div className="text-center mb-8">
            <h3 className="text-lg font-semibold mb-2">🎬 GIF Editor</h3>
            <p className="text-muted-foreground">Convert videos to GIFs with professional effects and filters</p>
          </div>

        <ScrollableCard>
          <Tabs defaultValue="editor" className="w-full internal-tabs-container">
            <TabsList className="grid w-full grid-cols-3 tabs-list">
              <TabsTrigger value="editor">GIF Editor</TabsTrigger>
              <TabsTrigger value="effects">Effects Gallery</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>

        <TabsContent value="editor" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Input Configuration
                </CardTitle>
                <CardDescription>Configure your video input and processing settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="inputPath">Input File Path</Label>
                  <Input
                    id="inputPath"
                    placeholder="/path/to/your/video.mp4"
                    value={inputPath}
                    onChange={(e) => setInputPath(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="effect">Effect</Label>
                  <Select value={selectedEffect} onValueChange={setSelectedEffect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an effect" />
                    </SelectTrigger>
                    <SelectContent>
                      {effects.map((effect: string) => (
                        <SelectItem key={effect} value={effect}>
                          <div className="flex items-center gap-2">
                            {getEffectIcon(effect)}
                            <span className="capitalize">{effect}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedEffect && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {getEffectDescription(selectedEffect)}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fps">FPS</Label>
                    <Input
                      id="fps"
                      type="number"
                      min="1"
                      max="60"
                      value={fps}
                      onChange={(e) => setFps(parseInt(e.target.value) || 15)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="quality">Quality</Label>
                    <Select value={quality} onValueChange={(value: 'high' | 'medium' | 'low') => setQuality(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High (256 colors)</SelectItem>
                        <SelectItem value="medium">Medium (128 colors)</SelectItem>
                        <SelectItem value="low">Low (64 colors)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="duration">Duration (seconds, optional)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    placeholder="Auto-detect"
                    value={duration || ''}
                    onChange={(e) => setDuration(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Processing Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Processing Status
                </CardTitle>
                <CardDescription>Monitor your GIF generation progress</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Processing...</span>
                      <span>{processingProgress}%</span>
                    </div>
                    <Progress value={processingProgress} className="w-full" />
                  </div>
                )}

                {result && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {result.success ? (
                        <Badge variant="default">Success</Badge>
                      ) : (
                        <Badge variant="destructive">Failed</Badge>
                      )}
                    </div>
                    
                    {result.success && result.outputPath && (
                      <div className="space-y-2">
                        <p className="text-sm"><strong>Output:</strong> {result.outputPath}</p>
                        {result.fileSize && (
                          <p className="text-sm"><strong>Size:</strong> {(result.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                        )}
                        {result.duration && (
                          <p className="text-sm"><strong>Duration:</strong> {result.duration.toFixed(1)}s</p>
                        )}
                        {result.frames && (
                          <p className="text-sm"><strong>Frames:</strong> {result.frames}</p>
                        )}
                        <Button className="w-full" onClick={() => window.open(result.outputPath, '_blank')}>
                          <Download className="w-4 h-4 mr-2" />
                          Download GIF
                        </Button>
                      </div>
                    )}

                    {result.error && (
                      <p className="text-sm text-destructive">{result.error}</p>
                    )}
                  </div>
                )}

                <Button 
                  onClick={handleProcessGif}
                  disabled={isProcessing || !inputPath || !selectedEffect}
                  className="w-full"
                >
                  {isProcessing ? 'Processing...' : 'Apply Effect'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="effects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Effects</CardTitle>
              <CardDescription>Choose from our collection of professional GIF effects</CardDescription>
            </CardHeader>
            <CardContent>
              {effectsLoading ? (
                <div className="text-center py-8">Loading effects...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {effects.map((effect: string) => (
                    <Card 
                      key={effect} 
                      className={`cursor-pointer transition-all hover:shadow-md ${selectedEffect === effect ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => setSelectedEffect(effect)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          {getEffectIcon(effect)}
                          <h3 className="font-semibold capitalize">{effect}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {getEffectDescription(effect)}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Processing Results</CardTitle>
              <CardDescription>View and download your processed GIFs</CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Latest Result:</span>
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.success ? "Success" : "Failed"}
                    </Badge>
                  </div>
                  
                  {result.success && result.outputPath && (
                    <div className="p-4 bg-muted rounded-lg space-y-2">
                      <p><strong>File:</strong> {result.outputPath}</p>
                      {result.fileSize && <p><strong>Size:</strong> {(result.fileSize / 1024 / 1024).toFixed(2)} MB</p>}
                      {result.duration && <p><strong>Duration:</strong> {result.duration.toFixed(1)}s</p>}
                      {result.frames && <p><strong>Frames:</strong> {result.frames}</p>}
                      
                      <Button className="mt-2" onClick={() => window.open(result.outputPath, '_blank')}>
                        <Download className="w-4 h-4 mr-2" />
                        Download GIF
                      </Button>
                    </div>
                  )}
                  
                  {result.error && (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-destructive">{result.error}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No results yet. Process a GIF to see results here.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
          </Tabs>
        </ScrollableCard>
        </div>
      </CardContent>
    </Card>
  );
}