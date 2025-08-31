import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

export interface GifEditOptions {
  effect: string;
  inputPath: string;
  outputPath?: string;
  duration?: number;
  fps?: number;
  quality?: 'high' | 'medium' | 'low';
  filters?: string[];
}

export interface GifEditResult {
  success: boolean;
  outputPath?: string;
  error?: string;
  fileSize?: number;
  duration?: number;
  frames?: number;
}

export class GifEditorService {
  private static instance: GifEditorService;
  private readonly tempDir = './uploads/temp';
  private readonly outputDir = './uploads/gifs';

  static getInstance(): GifEditorService {
    if (!GifEditorService.instance) {
      GifEditorService.instance = new GifEditorService();
    }
    return GifEditorService.instance;
  }

  constructor() {
    this.ensureDirectories();
  }

  private async ensureDirectories() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
      await fs.mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create directories:', error);
    }
  }

  async editGif(options: GifEditOptions): Promise<GifEditResult> {
    try {
      const { effect, inputPath, fps = 15, quality = 'medium' } = options;
      const outputPath = options.outputPath || this.generateOutputPath();

      // Ensure input file exists
      await fs.access(inputPath);

      const result = await this.applyEffect(effect, inputPath, outputPath, { fps, quality });
      
      if (result.success && result.outputPath) {
        const stats = await fs.stat(result.outputPath);
        result.fileSize = stats.size;
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: `GIF editing failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async applyEffect(effect: string, inputPath: string, outputPath: string, options: { fps: number; quality: string }): Promise<GifEditResult> {
    const { fps, quality } = options;
    
    // Quality settings
    const qualityMap = {
      high: { colors: 256, dither: 'bayer' },
      medium: { colors: 128, dither: 'floyd_steinberg' },
      low: { colors: 64, dither: 'none' }
    };
    
    const qualitySettings = qualityMap[quality as keyof typeof qualityMap] || qualityMap.medium;

    switch (effect.toLowerCase()) {
      case 'fade':
        return this.applyFadeEffect(inputPath, outputPath, fps, qualitySettings);
      
      case 'zoom':
        return this.applyZoomEffect(inputPath, outputPath, fps, qualitySettings);
      
      case 'blur':
        return this.applyBlurEffect(inputPath, outputPath, fps, qualitySettings);
      
      case 'sepia':
        return this.applySepiaEffect(inputPath, outputPath, fps, qualitySettings);
      
      case 'vintage':
        return this.applyVintageEffect(inputPath, outputPath, fps, qualitySettings);
      
      case 'glitch':
        return this.applyGlitchEffect(inputPath, outputPath, fps, qualitySettings);
      
      case 'neon':
        return this.applyNeonEffect(inputPath, outputPath, fps, qualitySettings);
      
      case 'rainbow':
        return this.applyRainbowEffect(inputPath, outputPath, fps, qualitySettings);
      
      case 'sketch':
        return this.applySketchEffect(inputPath, outputPath, fps, qualitySettings);
      
      case 'cyberpunk':
        return this.applyCyberpunkEffect(inputPath, outputPath, fps, qualitySettings);
      
      case 'convert':
        return this.convertToGif(inputPath, outputPath, fps, qualitySettings);
      
      default:
        return this.convertToGif(inputPath, outputPath, fps, qualitySettings);
    }
  }

  private async applyFadeEffect(inputPath: string, outputPath: string, fps: number, quality: any): Promise<GifEditResult> {
    return this.runPythonScript('gif_fade', {
      input_path: inputPath,
      output_path: outputPath,
      fps,
      colors: quality.colors,
      fade_duration: 0.5
    });
  }

  private async applyZoomEffect(inputPath: string, outputPath: string, fps: number, quality: any): Promise<GifEditResult> {
    return this.runPythonScript('gif_zoom', {
      input_path: inputPath,
      output_path: outputPath,
      fps,
      colors: quality.colors,
      zoom_factor: 1.2
    });
  }

  private async applyBlurEffect(inputPath: string, outputPath: string, fps: number, quality: any): Promise<GifEditResult> {
    return this.runPythonScript('gif_blur', {
      input_path: inputPath,
      output_path: outputPath,
      fps,
      colors: quality.colors,
      blur_radius: 3
    });
  }

  private async applySepiaEffect(inputPath: string, outputPath: string, fps: number, quality: any): Promise<GifEditResult> {
    return this.runPythonScript('gif_sepia', {
      input_path: inputPath,
      output_path: outputPath,
      fps,
      colors: quality.colors
    });
  }

  private async applyVintageEffect(inputPath: string, outputPath: string, fps: number, quality: any): Promise<GifEditResult> {
    return this.runPythonScript('gif_vintage', {
      input_path: inputPath,
      output_path: outputPath,
      fps,
      colors: quality.colors,
      noise_intensity: 0.3,
      vignette_strength: 0.5
    });
  }

  private async applyGlitchEffect(inputPath: string, outputPath: string, fps: number, quality: any): Promise<GifEditResult> {
    return this.runPythonScript('gif_glitch', {
      input_path: inputPath,
      output_path: outputPath,
      fps,
      colors: quality.colors,
      glitch_intensity: 0.4
    });
  }

  private async applyNeonEffect(inputPath: string, outputPath: string, fps: number, quality: any): Promise<GifEditResult> {
    return this.runPythonScript('gif_neon', {
      input_path: inputPath,
      output_path: outputPath,
      fps,
      colors: quality.colors,
      glow_intensity: 0.8
    });
  }

  private async applyRainbowEffect(inputPath: string, outputPath: string, fps: number, quality: any): Promise<GifEditResult> {
    return this.runPythonScript('gif_rainbow', {
      input_path: inputPath,
      output_path: outputPath,
      fps,
      colors: quality.colors,
      rainbow_speed: 2
    });
  }

  private async applySketchEffect(inputPath: string, outputPath: string, fps: number, quality: any): Promise<GifEditResult> {
    return this.runPythonScript('gif_sketch', {
      input_path: inputPath,
      output_path: outputPath,
      fps,
      colors: quality.colors,
      line_thickness: 2
    });
  }

  private async applyCyberpunkEffect(inputPath: string, outputPath: string, fps: number, quality: any): Promise<GifEditResult> {
    return this.runPythonScript('gif_cyberpunk', {
      input_path: inputPath,
      output_path: outputPath,
      fps,
      colors: quality.colors,
      neon_colors: ['#ff0080', '#00ff80', '#8000ff', '#ff8000']
    });
  }

  private async convertToGif(inputPath: string, outputPath: string, fps: number, quality: any): Promise<GifEditResult> {
    return this.runPythonScript('video_to_gif', {
      input_path: inputPath,
      output_path: outputPath,
      fps,
      colors: quality.colors,
      optimize: true
    });
  }

  private async runPythonScript(scriptName: string, params: any): Promise<GifEditResult> {
    return new Promise((resolve) => {
      const pythonScript = `
import sys
import json
import os
from moviepy.editor import VideoFileClip, ImageSequenceClip
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance
import cv2

def ${scriptName}(params):
    try:
        input_path = params['input_path']
        output_path = params['output_path']
        fps = params.get('fps', 15)
        colors = params.get('colors', 128)
        
        # Load video or image sequence
        if input_path.lower().endswith(('.mp4', '.avi', '.mov', '.mkv')):
            clip = VideoFileClip(input_path)
        else:
            # Assume it's already a GIF or image
            clip = VideoFileClip(input_path)
        
        # Apply the specific effect based on script name
        if '${scriptName}' == 'gif_fade':
            fade_duration = params.get('fade_duration', 0.5)
            clip = clip.fadein(fade_duration).fadeout(fade_duration)
        
        elif '${scriptName}' == 'gif_zoom':
            zoom_factor = params.get('zoom_factor', 1.2)
            def zoom_effect(get_frame, t):
                frame = get_frame(t)
                h, w = frame.shape[:2]
                center_x, center_y = w // 2, h // 2
                zoom = 1 + (zoom_factor - 1) * (t / clip.duration)
                M = cv2.getRotationMatrix2D((center_x, center_y), 0, zoom)
                return cv2.warpAffine(frame, M, (w, h))
            clip = clip.fl(zoom_effect)
        
        elif '${scriptName}' == 'gif_blur':
            blur_radius = params.get('blur_radius', 3)
            def blur_effect(get_frame, t):
                frame = get_frame(t)
                return cv2.GaussianBlur(frame, (blur_radius*2+1, blur_radius*2+1), 0)
            clip = clip.fl(blur_effect)
        
        elif '${scriptName}' == 'gif_sepia':
            def sepia_effect(get_frame, t):
                frame = get_frame(t)
                sepia_filter = np.array([[0.393, 0.769, 0.189],
                                       [0.349, 0.686, 0.168],
                                       [0.272, 0.534, 0.131]])
                return np.dot(frame, sepia_filter.T)
            clip = clip.fl(sepia_effect)
        
        elif '${scriptName}' == 'gif_vintage':
            noise_intensity = params.get('noise_intensity', 0.3)
            def vintage_effect(get_frame, t):
                frame = get_frame(t)
                # Add noise
                noise = np.random.normal(0, noise_intensity * 255, frame.shape)
                frame = np.clip(frame + noise, 0, 255).astype(np.uint8)
                # Reduce saturation
                hsv = cv2.cvtColor(frame, cv2.COLOR_RGB2HSV)
                hsv[:,:,1] = hsv[:,:,1] * 0.7
                return cv2.cvtColor(hsv, cv2.COLOR_HSV2RGB)
            clip = clip.fl(vintage_effect)
        
        elif '${scriptName}' == 'gif_glitch':
            glitch_intensity = params.get('glitch_intensity', 0.4)
            def glitch_effect(get_frame, t):
                frame = get_frame(t)
                if np.random.random() < glitch_intensity:
                    # Random channel shifts
                    shift = np.random.randint(-10, 11)
                    frame[:,:,0] = np.roll(frame[:,:,0], shift, axis=1)
                    frame[:,:,2] = np.roll(frame[:,:,2], -shift, axis=1)
                return frame
            clip = clip.fl(glitch_effect)
        
        elif '${scriptName}' == 'gif_neon':
            glow_intensity = params.get('glow_intensity', 0.8)
            def neon_effect(get_frame, t):
                frame = get_frame(t)
                # Edge detection
                gray = cv2.cvtColor(frame, cv2.COLOR_RGB2GRAY)
                edges = cv2.Canny(gray, 50, 150)
                # Create neon glow
                glow = cv2.dilate(edges, np.ones((5,5), np.uint8), iterations=2)
                neon_frame = frame.copy()
                neon_frame[glow > 0] = [0, 255, 255]  # Cyan neon
                return cv2.addWeighted(frame, 1-glow_intensity, neon_frame, glow_intensity, 0)
            clip = clip.fl(neon_effect)
        
        elif '${scriptName}' == 'gif_rainbow':
            rainbow_speed = params.get('rainbow_speed', 2)
            def rainbow_effect(get_frame, t):
                frame = get_frame(t)
                hsv = cv2.cvtColor(frame, cv2.COLOR_RGB2HSV)
                hue_shift = int((t * rainbow_speed * 180) % 180)
                hsv[:,:,0] = (hsv[:,:,0] + hue_shift) % 180
                return cv2.cvtColor(hsv, cv2.COLOR_HSV2RGB)
            clip = clip.fl(rainbow_effect)
        
        elif '${scriptName}' == 'gif_sketch':
            line_thickness = params.get('line_thickness', 2)
            def sketch_effect(get_frame, t):
                frame = get_frame(t)
                gray = cv2.cvtColor(frame, cv2.COLOR_RGB2GRAY)
                edges = cv2.Canny(gray, 50, 150)
                edges = cv2.dilate(edges, np.ones((line_thickness, line_thickness), np.uint8))
                sketch = cv2.cvtColor(edges, cv2.COLOR_GRAY2RGB)
                return 255 - sketch  # Invert for white background
            clip = clip.fl(sketch_effect)
        
        elif '${scriptName}' == 'gif_cyberpunk':
            neon_colors = params.get('neon_colors', ['#ff0080', '#00ff80', '#8000ff'])
            def cyberpunk_effect(get_frame, t):
                frame = get_frame(t)
                # Dark background
                frame = frame * 0.3
                # Add neon highlights
                gray = cv2.cvtColor(frame.astype(np.uint8), cv2.COLOR_RGB2GRAY)
                edges = cv2.Canny(gray, 30, 100)
                # Cycle through neon colors
                color_index = int((t * 2) % len(neon_colors))
                neon_color = neon_colors[color_index]
                # Convert hex to RGB
                neon_rgb = tuple(int(neon_color[i:i+2], 16) for i in (1, 3, 5))
                frame[edges > 0] = neon_rgb
                return frame.astype(np.uint8)
            clip = clip.fl(cyberpunk_effect)
        
        # Write GIF with optimization
        clip.write_gif(output_path, fps=fps, opt='OptimizeTransparency', colors=colors)
        clip.close()
        
        # Get file stats
        file_size = os.path.getsize(output_path)
        duration = clip.duration
        
        return {
            'success': True,
            'output_path': output_path,
            'file_size': file_size,
            'duration': duration,
            'frames': int(duration * fps)
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

if __name__ == '__main__':
    params = json.loads(sys.argv[1])
    result = ${scriptName}(params)
    print(json.dumps(result))
`;

      const pythonProcess = spawn('python3', ['-c', pythonScript, JSON.stringify(params)]);
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
              success: false,
              error: `Failed to parse Python output: ${parseError instanceof Error ? parseError.message : String(parseError)}`
            });
          }
        } else {
          resolve({
            success: false,
            error: error || `Python process exited with code ${code}`
          });
        }
      });
    });
  }

  private generateOutputPath(): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    return path.join(this.outputDir, `gif_${timestamp}_${randomId}.gif`);
  }

  async getAvailableEffects(): Promise<string[]> {
    return [
      'convert',    // Basic video to GIF conversion
      'fade',       // Fade in/out effect
      'zoom',       // Zoom effect
      'blur',       // Blur effect
      'sepia',      // Sepia tone
      'vintage',    // Vintage with noise and vignette
      'glitch',     // Digital glitch effect
      'neon',       // Neon glow effect
      'rainbow',    // Rainbow color cycling
      'sketch',     // Pencil sketch effect
      'cyberpunk'   // Cyberpunk neon style
    ];
  }

  async deleteGif(filePath: string): Promise<boolean> {
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error('Failed to delete GIF:', error);
      return false;
    }
  }
}

export const gifEditorService = GifEditorService.getInstance();