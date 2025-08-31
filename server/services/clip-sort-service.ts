import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';

export interface ClipMetadata {
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

export interface SortResult {
  success: boolean;
  sortedClips?: ClipMetadata[];
  error?: string;
  totalClips?: number;
  categories?: { [key: string]: number };
}

export class ClipSortService {
  private static instance: ClipSortService;
  private readonly clipsDir = './uploads/clips';
  private readonly metadataFile = './uploads/clip-metadata.json';

  static getInstance(): ClipSortService {
    if (!ClipSortService.instance) {
      ClipSortService.instance = new ClipSortService();
    }
    return ClipSortService.instance;
  }

  constructor() {
    this.ensureDirectories();
  }

  private async ensureDirectories() {
    try {
      await fs.mkdir(this.clipsDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create clips directory:', error);
    }
  }

  async sortClips(): Promise<SortResult> {
    try {
      const clips = await this.getClipFiles();
      if (clips.length === 0) {
        return {
          success: true,
          sortedClips: [],
          totalClips: 0,
          categories: {}
        };
      }

      const analyzedClips: ClipMetadata[] = [];
      
      for (const clipPath of clips) {
        const metadata = await this.analyzeClip(clipPath);
        if (metadata) {
          analyzedClips.push(metadata);
        }
      }

      // Sort by niche, then by emotion, then by confidence
      const sortedClips = analyzedClips.sort((a, b) => {
        if (a.niche !== b.niche) {
          return a.niche.localeCompare(b.niche);
        }
        if (a.emotion !== b.emotion) {
          return a.emotion.localeCompare(b.emotion);
        }
        return b.confidence - a.confidence;
      });

      // Generate categories stats
      const categories = this.generateCategoryStats(sortedClips);

      // Save metadata
      await this.saveMetadata(sortedClips);

      return {
        success: true,
        sortedClips,
        totalClips: sortedClips.length,
        categories
      };

    } catch (error) {
      return {
        success: false,
        error: `Clip sorting failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async getClipFiles(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.clipsDir);
      return files
        .filter(file => this.isVideoFile(file))
        .map(file => path.join(this.clipsDir, file));
    } catch (error) {
      return [];
    }
  }

  private isVideoFile(filename: string): boolean {
    const videoExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv', '.gif'];
    return videoExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  }

  private async analyzeClip(clipPath: string): Promise<ClipMetadata | null> {
    try {
      const stats = await fs.stat(clipPath);
      const filename = path.basename(clipPath);
      
      // AI-powered analysis using Python script
      const analysis = await this.runAIAnalysis(clipPath);
      
      return {
        id: this.generateClipId(filename),
        filename,
        path: clipPath,
        niche: analysis.niche || 'general',
        emotion: analysis.emotion || 'neutral',
        confidence: analysis.confidence || 0.5,
        duration: analysis.duration,
        size: stats.size,
        createdAt: stats.birthtime,
        tags: analysis.tags || []
      };
    } catch (error: unknown) {
      console.error(`Failed to analyze clip ${clipPath}:`, error);
      return null;
    }
  }

  private async runAIAnalysis(clipPath: string): Promise<any> {
    return new Promise((resolve) => {
      const pythonScript = `
import sys
import json
import cv2
import numpy as np
from moviepy.editor import VideoFileClip
import os

def analyze_clip(clip_path):
    try:
        # Load video
        cap = cv2.VideoCapture(clip_path)
        if not cap.isOpened():
            raise Exception("Could not open video file")
        
        # Get basic video info
        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_count = cap.get(cv2.CAP_PROP_FRAME_COUNT)
        duration = frame_count / fps if fps > 0 else 0
        
        # Sample frames for analysis
        sample_frames = []
        total_frames = int(frame_count)
        sample_interval = max(1, total_frames // 10)  # Sample 10 frames
        
        for i in range(0, total_frames, sample_interval):
            cap.set(cv2.CAP_PROP_POS_FRAMES, i)
            ret, frame = cap.read()
            if ret:
                sample_frames.append(frame)
        
        cap.release()
        
        if not sample_frames:
            raise Exception("No frames could be extracted")
        
        # Analyze visual content
        analysis = analyze_visual_content(sample_frames, clip_path)
        analysis['duration'] = duration
        
        return analysis
        
    except Exception as e:
        return {
            'niche': 'general',
            'emotion': 'neutral',
            'confidence': 0.3,
            'tags': ['unanalyzed'],
            'error': str(e)
        }

def analyze_visual_content(frames, clip_path):
    try:
        # Color analysis
        dominant_colors = analyze_colors(frames)
        
        # Motion analysis
        motion_intensity = analyze_motion(frames)
        
        # Scene analysis
        scene_type = analyze_scene_type(frames)
        
        # Determine niche based on visual features
        niche = determine_niche(dominant_colors, motion_intensity, scene_type, clip_path)
        
        # Determine emotion based on visual cues
        emotion = determine_emotion(dominant_colors, motion_intensity, scene_type)
        
        # Calculate confidence based on analysis quality
        confidence = calculate_confidence(len(frames), motion_intensity)
        
        # Generate tags
        tags = generate_tags(niche, emotion, scene_type, motion_intensity)
        
        return {
            'niche': niche,
            'emotion': emotion,
            'confidence': confidence,
            'tags': tags,
            'scene_type': scene_type,
            'motion_intensity': motion_intensity,
            'dominant_colors': dominant_colors
        }
        
    except Exception as e:
        return {
            'niche': 'general',
            'emotion': 'neutral',
            'confidence': 0.2,
            'tags': ['analysis_error']
        }

def analyze_colors(frames):
    all_colors = []
    for frame in frames:
        # Convert to RGB and flatten
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        pixels = rgb_frame.reshape(-1, 3)
        
        # Sample pixels to avoid memory issues
        sample_size = min(1000, len(pixels))
        sampled = pixels[np.random.choice(len(pixels), sample_size, replace=False)]
        all_colors.extend(sampled)
    
    if not all_colors:
        return ['neutral']
    
    all_colors = np.array(all_colors)
    
    # Simple color categorization
    avg_color = np.mean(all_colors, axis=0)
    r, g, b = avg_color
    
    if r > g and r > b:
        if r > 150:
            return ['red', 'warm']
        else:
            return ['dark_red', 'dramatic']
    elif g > r and g > b:
        if g > 150:
            return ['green', 'natural']
        else:
            return ['dark_green', 'moody']
    elif b > r and b > g:
        if b > 150:
            return ['blue', 'cool']
        else:
            return ['dark_blue', 'serious']
    else:
        brightness = (r + g + b) / 3
        if brightness > 180:
            return ['bright', 'energetic']
        elif brightness < 80:
            return ['dark', 'mysterious']
        else:
            return ['neutral', 'balanced']

def analyze_motion(frames):
    if len(frames) < 2:
        return 0.0
    
    total_motion = 0
    for i in range(1, len(frames)):
        # Convert to grayscale
        gray1 = cv2.cvtColor(frames[i-1], cv2.COLOR_BGR2GRAY)
        gray2 = cv2.cvtColor(frames[i], cv2.COLOR_BGR2GRAY)
        
        # Calculate optical flow
        flow = cv2.calcOpticalFlowPyrLK(gray1, gray2, 
                                       cv2.goodFeaturesToTrack(gray1, 100, 0.3, 7),
                                       None)[0]
        
        if flow is not None:
            motion = np.mean(np.linalg.norm(flow, axis=1))
            total_motion += motion
    
    return total_motion / (len(frames) - 1)

def analyze_scene_type(frames):
    if not frames:
        return 'unknown'
    
    # Analyze first frame for scene detection
    frame = frames[0]
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    
    # Edge density for complexity
    edges = cv2.Canny(gray, 50, 150)
    edge_density = np.sum(edges > 0) / edges.size
    
    # Brightness analysis
    brightness = np.mean(gray)
    
    if edge_density > 0.1:
        if brightness > 150:
            return 'complex_bright'
        elif brightness < 80:
            return 'complex_dark'
        else:
            return 'complex_normal'
    else:
        if brightness > 150:
            return 'simple_bright'
        elif brightness < 80:
            return 'simple_dark'
        else:
            return 'simple_normal'

def determine_niche(colors, motion, scene_type, clip_path):
    filename = os.path.basename(clip_path).lower()
    
    # Filename-based detection
    if any(word in filename for word in ['gaming', 'game', 'stream']):
        return 'gaming'
    elif any(word in filename for word in ['food', 'cooking', 'recipe']):
        return 'food'
    elif any(word in filename for word in ['fitness', 'workout', 'gym']):
        return 'fitness'
    elif any(word in filename for word in ['tech', 'review', 'unbox']):
        return 'tech'
    elif any(word in filename for word in ['music', 'song', 'dance']):
        return 'music'
    elif any(word in filename for word in ['travel', 'vlog', 'adventure']):
        return 'travel'
    elif any(word in filename for word in ['comedy', 'funny', 'meme']):
        return 'comedy'
    elif any(word in filename for word in ['education', 'tutorial', 'how']):
        return 'education'
    
    # Visual-based detection
    if motion > 10:
        if 'energetic' in colors or 'bright' in colors:
            return 'entertainment'
        else:
            return 'sports'
    elif 'natural' in colors or 'green' in colors:
        return 'lifestyle'
    elif 'dark' in colors and motion < 3:
        return 'cinematic'
    elif 'warm' in colors:
        return 'lifestyle'
    else:
        return 'general'

def determine_emotion(colors, motion, scene_type):
    if motion > 15:
        if 'bright' in colors or 'energetic' in colors:
            return 'excited'
        else:
            return 'intense'
    elif motion > 8:
        if 'warm' in colors:
            return 'happy'
        elif 'cool' in colors:
            return 'calm'
        else:
            return 'dynamic'
    elif motion < 3:
        if 'dark' in colors or 'mysterious' in colors:
            return 'serious'
        elif 'bright' in colors:
            return 'peaceful'
        else:
            return 'contemplative'
    else:
        if 'warm' in colors:
            return 'positive'
        elif 'cool' in colors:
            return 'neutral'
        else:
            return 'balanced'

def calculate_confidence(frame_count, motion):
    base_confidence = 0.5
    
    # More frames = better analysis
    frame_bonus = min(0.3, frame_count * 0.03)
    
    # Motion detection quality
    motion_bonus = min(0.2, motion * 0.02)
    
    return min(1.0, base_confidence + frame_bonus + motion_bonus)

def generate_tags(niche, emotion, scene_type, motion):
    tags = [niche, emotion]
    
    if motion > 10:
        tags.append('high_motion')
    elif motion < 3:
        tags.append('static')
    else:
        tags.append('moderate_motion')
    
    if 'bright' in scene_type:
        tags.append('bright')
    elif 'dark' in scene_type:
        tags.append('dark')
    
    if 'complex' in scene_type:
        tags.append('detailed')
    else:
        tags.append('simple')
    
    return tags

if __name__ == '__main__':
    clip_path = sys.argv[1]
    result = analyze_clip(clip_path)
    print(json.dumps(result))
`;

      const pythonProcess = spawn('python3', ['-c', pythonScript, clipPath]);
      let output = '';
      let error = '';

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code === 0 && output.trim()) {
          try {
            const result = JSON.parse(output.trim());
            resolve(result);
          } catch (parseError) {
            resolve({
              niche: 'general',
              emotion: 'neutral',
              confidence: 0.3,
              tags: ['parse_error']
            });
          }
        } else {
          resolve({
            niche: 'general',
            emotion: 'neutral',
            confidence: 0.2,
            tags: ['analysis_failed']
          });
        }
      });
    });
  }

  private generateClipId(filename: string): string {
    return `clip_${Date.now()}_${filename.replace(/[^a-zA-Z0-9]/g, '_')}`;
  }

  private generateCategoryStats(clips: ClipMetadata[]): { [key: string]: number } {
    const stats: { [key: string]: number } = {};
    
    // Count by niche
    clips.forEach(clip => {
      const key = `niche_${clip.niche}`;
      stats[key] = (stats[key] || 0) + 1;
    });
    
    // Count by emotion
    clips.forEach(clip => {
      const key = `emotion_${clip.emotion}`;
      stats[key] = (stats[key] || 0) + 1;
    });
    
    return stats;
  }

  private async saveMetadata(clips: ClipMetadata[]): Promise<void> {
    try {
      const metadata = {
        lastUpdated: new Date().toISOString(),
        totalClips: clips.length,
        clips: clips
      };
      
      await fs.writeFile(this.metadataFile, JSON.stringify(metadata, null, 2));
    } catch (error) {
      console.error('Failed to save metadata:', error);
    }
  }

  async getClipsByNiche(niche: string): Promise<ClipMetadata[]> {
    try {
      const metadata = await this.loadMetadata();
      return metadata.clips.filter(clip => clip.niche === niche);
    } catch (error) {
      return [];
    }
  }

  async getClipsByEmotion(emotion: string): Promise<ClipMetadata[]> {
    try {
      const metadata = await this.loadMetadata();
      return metadata.clips.filter(clip => clip.emotion === emotion);
    } catch (error) {
      return [];
    }
  }

  private async loadMetadata(): Promise<{ clips: ClipMetadata[] }> {
    try {
      const data = await fs.readFile(this.metadataFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return { clips: [] };
    }
  }

  async getAvailableNiches(): Promise<string[]> {
    const metadata = await this.loadMetadata();
    const niches = Array.from(new Set(metadata.clips.map(clip => clip.niche)));
    return niches.sort();
  }

  async getAvailableEmotions(): Promise<string[]> {
    const metadata = await this.loadMetadata();
    const emotions = Array.from(new Set(metadata.clips.map(clip => clip.emotion)));
    return emotions.sort();
  }
}

export const clipSortService = ClipSortService.getInstance();