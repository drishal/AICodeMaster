import OpenAI from 'openai';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ReelProject {
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
  createdAt: Date;
  status: 'draft' | 'processing' | 'completed' | 'error';
  outputPath?: string;
  progress?: number;
}

export class ReelEditorService {
  private projectsDir = './uploads/reel-projects';
  private outputDir = './uploads/reel-outputs';

  constructor() {
    this.ensureDirectories();
  }

  private async ensureDirectories() {
    try {
      await fs.mkdir(this.projectsDir, { recursive: true });
      await fs.mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      console.error('Error creating directories:', error);
    }
  }

  // Smart script generation with GPT
  async generateSmartScript(topic: string, style: string, duration: number, voiceProvider: string = 'gTTS') {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert reel script writer specializing in ${style} content. Create engaging scripts optimized for ${voiceProvider} voice synthesis. Consider:
            - Natural speech patterns and pacing
            - Voice synthesis-friendly language
            - Emotional engagement for ${style} style
            - Perfect timing for ${duration} seconds
            
            Return JSON with:
            {
              "script": "complete script with natural speech flow",
              "voiceNotes": "specific instructions for voice synthesis",
              "emotionalTone": "recommended emotion/tone",
              "scenes": [
                {
                  "timestamp": "0:00-0:05",
                  "text": "scene narration with speech-optimized phrasing",
                  "visual_description": "visual elements to sync with voice",
                  "voiceInstruction": "specific voice direction for this scene",
                  "emotion": "scene-specific emotion"
                }
              ],
              "callToAction": "engaging CTA with voice emphasis"
            }`
          },
          {
            role: "user",
            content: `Create a ${duration}-second ${style} reel script about: ${topic}. Optimize for ${voiceProvider} voice synthesis with natural speech patterns.`
          }
        ],
        response_format: { type: "json_object" }
      });

      const scriptData = JSON.parse(response.choices[0].message.content || '{}');
      return {
        success: true,
        script: scriptData.script,
        voiceNotes: scriptData.voiceNotes,
        emotionalTone: scriptData.emotionalTone,
        scenes: scriptData.scenes,
        callToAction: scriptData.callToAction
      };
    } catch (error) {
      console.error('Smart script generation error:', error);
      return {
        success: false,
        error: 'Failed to generate smart script'
      };
    }
  }

  // Generate AI script for reel (legacy method)
  async generateScript(topic: string, style: string, duration: number) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a professional video script writer. Create engaging, concise scripts for social media reels. Return JSON with:
            {
              "script": "complete script with timing cues",
              "scenes": [
                {
                  "timestamp": "0:00-0:05",
                  "text": "scene narration",
                  "visual_description": "what should be shown",
                  "caption_text": "on-screen text",
                  "transition": "suggested transition effect"
                }
              ],
              "hook": "compelling opening line",
              "call_to_action": "ending CTA",
              "hashtags": ["relevant", "hashtags"],
              "music_mood": "suggested music mood"
            }`
          },
          {
            role: "user",
            content: `Create a ${duration}-second reel script about "${topic}" in ${style} style. Make it engaging and viral-worthy.`
          }
        ],
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error: any) {
      throw new Error(`Script generation failed: ${error.message}`);
    }
  }

  // Smart voice synthesis with multiple providers
  async synthesizeVoice(text: string, voiceSettings: any) {
    try {
      const { provider = 'gTTS', language = 'en', speed = 1.0, pitch = 0, voice = 'default', emotion = 'neutral', elevenlabsVoiceId } = voiceSettings;
      const outputPath = path.join(this.outputDir, `voice_${Date.now()}.wav`);

      switch (provider) {
        case 'elevenlabs':
          if (process.env.ELEVENLABS_API_KEY && elevenlabsVoiceId) {
            return await this.synthesizeElevenLabs(text, elevenlabsVoiceId, emotion, outputPath);
          } else {
            // Fallback to gTTS if ElevenLabs not configured
            return await this.synthesizeGTTS(text, language, speed, outputPath);
          }

        case 'pyttsx3':
          return await this.synthesizePyttsx3(text, voice, speed, pitch, outputPath);

        case 'gTTS':
        default:
          return await this.synthesizeGTTS(text, language, speed, outputPath);
      }
    } catch (error) {
      console.error('Voice synthesis error:', error);
      return {
        success: false,
        error: 'Failed to synthesize voice'
      };
    }
  }

  // ElevenLabs voice synthesis
  private async synthesizeElevenLabs(text: string, voiceId: string, emotion: string, outputPath: string): Promise<any> {
    return new Promise((resolve) => {
      const pythonScript = `
import requests
import json

try:
    url = f"https://api.elevenlabs.io/v1/text-to-speech/${voiceId}"
    
    headers = {
        "Accept": "audio/mpeg", 
        "Content-Type": "application/json",
        "xi-api-key": "${process.env.ELEVENLABS_API_KEY || ''}"
    }
    
    data = {
        "text": "${text.replace(/"/g, '\\"')}",
        "model_id": "eleven_monolingual_v1",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.5,
            "style": 0.5 if "${emotion}" == "neutral" else 0.8,
            "use_speaker_boost": True
        }
    }
    
    response = requests.post(url, json=data, headers=headers)
    if response.status_code == 200:
        with open("${outputPath}", 'wb') as f:
            f.write(response.content)
        print(json.dumps({"success": True, "path": "${outputPath}"}))
    else:
        print(json.dumps({"success": False, "error": f"ElevenLabs API error: {response.status_code}"}))
        
except Exception as e:
    print(json.dumps({"success": False, "error": str(e)}))
`;

      const python = spawn('python3', ['-c', pythonScript]);
      let output = '';

      python.stdout.on('data', (data) => {
        output += data.toString();
      });

      python.on('close', (code) => {
        try {
          const result = JSON.parse(output.trim());
          resolve(result);
        } catch {
          resolve({ success: false, error: 'ElevenLabs synthesis failed' });
        }
      });
    });
  }

  // pyttsx3 voice synthesis  
  private async synthesizePyttsx3(text: string, voice: string, speed: number, pitch: number, outputPath: string): Promise<any> {
    return new Promise((resolve) => {
      const pythonScript = `
import pyttsx3
import json

try:
    engine = pyttsx3.init()
    
    # Set voice
    voices = engine.getProperty('voices')
    if "${voice}" and len(voices) > 0:
        for v in voices:
            if "${voice}".lower() in v.name.lower():
                engine.setProperty('voice', v.id)
                break
    
    # Set speech rate
    engine.setProperty('rate', int(${speed} * 200))  # Convert to words per minute
    
    # Note: pyttsx3 doesn't support pitch directly
    engine.save_to_file("${text.replace(/"/g, '\\"')}", "${outputPath}")
    engine.runAndWait()
    
    print(json.dumps({"success": True, "path": "${outputPath}"}))
    
except Exception as e:
    print(json.dumps({"success": False, "error": str(e)}))
`;

      const python = spawn('python3', ['-c', pythonScript]);
      let output = '';

      python.stdout.on('data', (data) => {
        output += data.toString();
      });

      python.on('close', (code) => {
        try {
          const result = JSON.parse(output.trim());
          resolve(result);
        } catch {
          resolve({ success: false, error: 'pyttsx3 synthesis failed' });
        }
      });
    });
  }

  // gTTS voice synthesis (enhanced)
  private async synthesizeGTTS(text: string, language: string, speed: number, outputPath: string): Promise<any> {
    return new Promise((resolve) => {
      const pythonScript = `
import gtts
import json
from pydub import AudioSegment
import tempfile
import os

try:
    # Create TTS
    tts = gtts.gTTS(text="${text.replace(/"/g, '\\"')}", lang="${language}", slow=(${speed} < 0.8))
    
    # Save to temporary file
    temp_file = tempfile.mktemp(suffix='.mp3')
    tts.save(temp_file)
    
    # Adjust speed if needed
    if ${speed} != 1.0:
        audio = AudioSegment.from_mp3(temp_file)
        # Change speed
        new_audio = audio.speedup(playback_speed=${speed})
        new_audio.export("${outputPath}", format="wav")
    else:
        audio = AudioSegment.from_mp3(temp_file)
        audio.export("${outputPath}", format="wav")
    
    # Cleanup
    os.unlink(temp_file)
    
    print(json.dumps({"success": True, "path": "${outputPath}"}))
    
except Exception as e:
    print(json.dumps({"success": False, "error": str(e)}))
`;

      const python = spawn('python3', ['-c', pythonScript]);
      let output = '';

      python.stdout.on('data', (data) => {
        output += data.toString();
      });

      python.on('close', (code) => {
        try {
          const result = JSON.parse(output.trim());
          resolve(result);
        } catch {
          resolve({ success: false, error: 'gTTS synthesis failed' });
        }
      });
    });
  }

  // Generate voice narration using Python gTTS
  async generateVoice(text: string, settings: ReelProject['voiceSettings'], outputPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const pythonScript = `
import sys
import gtts
import os
from pydub import AudioSegment
from pydub.effects import speedup, pitch

def generate_voice(text, lang, speed, pitch_shift, output_path):
    try:
        # Generate TTS
        tts = gtts.gTTS(text=text, lang=lang, slow=False)
        temp_path = output_path.replace('.wav', '_temp.mp3')
        tts.save(temp_path)
        
        # Load and modify audio
        audio = AudioSegment.from_mp3(temp_path)
        
        # Adjust speed
        if speed != 1.0:
            audio = speedup(audio, playback_speed=speed)
        
        # Adjust pitch (simple method)
        if pitch_shift != 0:
            new_sample_rate = int(audio.frame_rate * (2.0 ** (pitch_shift / 12.0)))
            audio = audio._spawn(audio.raw_data, overrides={"frame_rate": new_sample_rate})
            audio = audio.set_frame_rate(44100)
        
        # Export as WAV
        audio.export(output_path, format="wav")
        
        # Cleanup
        os.remove(temp_path)
        
        print(f"SUCCESS:{output_path}")
        
    except Exception as e:
        print(f"ERROR:{str(e)}")

if __name__ == "__main__":
    text = sys.argv[1]
    lang = sys.argv[2]
    speed = float(sys.argv[3])
    pitch_shift = float(sys.argv[4])
    output_path = sys.argv[5]
    
    generate_voice(text, lang, speed, pitch_shift, output_path)
`;

      const process = spawn('python3', ['-c', pythonScript, 
        text, 
        settings.language, 
        settings.speed.toString(), 
        settings.pitch.toString(), 
        outputPath
      ]);

      let output = '';
      let error = '';

      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.stderr.on('data', (data) => {
        error += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0 && output.includes('SUCCESS:')) {
          resolve(outputPath);
        } else {
          reject(new Error(`Voice generation failed: ${error || 'Unknown error'}`));
        }
      });
    });
  }

  // Create video with MoviePy
  async createReel(project: ReelProject): Promise<string> {
    return new Promise((resolve, reject) => {
      const pythonScript = `
import sys
import json
from moviepy.editor import *
from moviepy.video.fx import resize, fadein, fadeout
from moviepy.audio.fx import audio_fadein, audio_fadeout
import numpy as np
import cv2
import os

def create_reel(project_data):
    try:
        project = json.loads(project_data)
        
        # Set up dimensions based on aspect ratio
        if project['aspectRatio'] == '9:16':
            width, height = 1080, 1920
        elif project['aspectRatio'] == '1:1':
            width, height = 1080, 1080
        else:  # 16:9
            width, height = 1920, 1080
        
        # Create base clips
        clips = []
        audio_clips = []
        
        # Background video/image generation
        bg_color = get_style_color(project['style'])
        background = ColorClip(size=(width, height), color=bg_color, duration=project['duration'])
        
        # Add gradient overlay
        gradient = create_gradient(width, height, project['style'])
        gradient_clip = ImageClip(gradient, duration=project['duration'])
        
        # Combine background
        video_clip = CompositeVideoClip([background, gradient_clip])
        
        # Add voice narration if available
        voice_path = f"./uploads/reel-projects/{project['id']}_voice.wav"
        if os.path.exists(voice_path):
            voice_audio = AudioFileClip(voice_path)
            audio_clips.append(voice_audio)
        
        # Add captions
        if project['captionSettings']['enabled']:
            caption_clips = create_captions(project, width, height)
            video_clip = CompositeVideoClip([video_clip] + caption_clips)
        
        # Add transitions and effects
        video_clip = apply_effects(video_clip, project['effects'])
        
        # Add background music
        if project['musicSettings']['enabled']:
            music_clip = generate_background_music(project['musicSettings'], project['duration'])
            if music_clip:
                audio_clips.append(music_clip)
        
        # Combine all audio
        if audio_clips:
            final_audio = CompositeAudioClip(audio_clips)
            video_clip = video_clip.set_audio(final_audio)
        
        # Export video
        output_path = f"./uploads/reel-outputs/{project['id']}_reel.mp4"
        video_clip.write_videofile(
            output_path,
            fps=30,
            codec='libx264',
            audio_codec='aac',
            temp_audiofile=f"./uploads/temp_{project['id']}_audio.m4a",
            remove_temp=True
        )
        
        print(f"SUCCESS:{output_path}")
        
    except Exception as e:
        print(f"ERROR:{str(e)}")

def get_style_color(style):
    colors = {
        'modern': (30, 30, 40),
        'tech': (0, 20, 40),
        'educational': (240, 240, 245),
        'business': (25, 35, 45),
        'cinematic': (10, 10, 15)
    }
    return colors.get(style, (30, 30, 40))

def create_gradient(width, height, style):
    # Create gradient overlay
    gradient = np.zeros((height, width, 3), dtype=np.uint8)
    
    if style == 'modern':
        # Blue to purple gradient
        for i in range(height):
            ratio = i / height
            gradient[i, :, 0] = int(50 + ratio * 100)  # Blue
            gradient[i, :, 1] = int(30 + ratio * 50)   # Green
            gradient[i, :, 2] = int(150 + ratio * 100) # Red
    elif style == 'tech':
        # Cyan to blue gradient
        for i in range(height):
            ratio = i / height
            gradient[i, :, 0] = int(200 - ratio * 150)
            gradient[i, :, 1] = int(100 + ratio * 100)
            gradient[i, :, 2] = int(50 + ratio * 100)
    
    return gradient

def create_captions(project, width, height):
    caption_clips = []
    scenes = project.get('scenes', [])
    
    for scene in scenes:
        if 'caption_text' in scene and scene['caption_text']:
            # Parse timestamp
            timestamp = scene['timestamp']
            start_time, end_time = parse_timestamp(timestamp)
            
            # Create text clip
            txt_clip = TextClip(
                scene['caption_text'],
                fontsize=project['captionSettings']['fontSize'],
                color=project['captionSettings']['color'],
                font='Arial-Bold'
            ).set_position(get_caption_position(project['captionSettings']['position'], width, height)).set_duration(end_time - start_time).set_start(start_time)
            
            caption_clips.append(txt_clip)
    
    return caption_clips

def parse_timestamp(timestamp):
    # Parse "0:00-0:05" format
    start_str, end_str = timestamp.split('-')
    start_time = parse_time(start_str)
    end_time = parse_time(end_str)
    return start_time, end_time

def parse_time(time_str):
    parts = time_str.split(':')
    if len(parts) == 2:
        return int(parts[0]) * 60 + int(parts[1])
    return int(parts[0])

def get_caption_position(position, width, height):
    if position == 'bottom':
        return ('center', height - 200)
    elif position == 'top':
        return ('center', 100)
    else:  # center
        return 'center'

def apply_effects(clip, effects):
    for effect in effects:
        if effect == 'fadein':
            clip = fadein(clip, 0.5)
        elif effect == 'fadeout':
            clip = fadeout(clip, 0.5)
        elif effect == 'zoom':
            clip = resize(clip, lambda t: 1 + 0.02 * t)
    
    return clip

def generate_background_music(music_settings, duration):
    # Simple tone generation for background music
    try:
        # Generate a simple ambient tone
        sample_rate = 44100
        t = np.linspace(0, duration, int(sample_rate * duration))
        
        # Create ambient music based on genre
        if music_settings['genre'] == 'ambient':
            frequency = 220  # A3
            wave = 0.3 * np.sin(2 * np.pi * frequency * t)
            wave += 0.2 * np.sin(2 * np.pi * frequency * 1.5 * t)
        else:
            frequency = 440  # A4
            wave = 0.2 * np.sin(2 * np.pi * frequency * t)
        
        # Apply volume
        wave = wave * music_settings['volume']
        
        # Create audio clip
        return AudioArrayClip(wave, fps=sample_rate)
        
    except Exception as e:
        print(f"Music generation error: {e}")
        return None

if __name__ == "__main__":
    project_data = sys.argv[1]
    create_reel(project_data)
`;

      const projectJson = JSON.stringify(project);
      const process = spawn('python3', ['-c', pythonScript, projectJson]);

      let output = '';
      let error = '';

      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.stderr.on('data', (data) => {
        error += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0 && output.includes('SUCCESS:')) {
          const outputPath = output.split('SUCCESS:')[1].trim();
          resolve(outputPath);
        } else {
          reject(new Error(`Reel creation failed: ${error || 'Unknown error'}`));
        }
      });
    });
  }

  // Create new reel project
  async createProject(data: {
    title: string;
    topic: string;
    style: ReelProject['style'];
    duration: number;
    aspectRatio: ReelProject['aspectRatio'];
    voiceSettings: ReelProject['voiceSettings'];
    captionSettings: ReelProject['captionSettings'];
    musicSettings: ReelProject['musicSettings'];
  }) {
    try {
      const projectId = `reel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Generate AI script
      const scriptData = await this.generateScript(data.topic, data.style, data.duration);
      
      const project: ReelProject = {
        id: projectId,
        title: data.title,
        description: `AI-generated reel about ${data.topic}`,
        script: scriptData.script || `Professional ${data.style} style reel about ${data.topic}`,
        style: data.style,
        duration: data.duration,
        aspectRatio: data.aspectRatio,
        voiceSettings: data.voiceSettings,
        captionSettings: data.captionSettings,
        musicSettings: data.musicSettings,
        transitions: ['fadein', 'fadeout'],
        effects: ['zoom'],
        createdAt: new Date(),
        status: 'draft',
        progress: 0,
        ...scriptData
      };

      // Save project data
      const projectPath = path.join(this.projectsDir, `${projectId}.json`);
      await fs.writeFile(projectPath, JSON.stringify(project, null, 2));

      return project;
    } catch (error: any) {
      throw new Error(`Project creation failed: ${error.message}`);
    }
  }

  // Generate reel video
  async generateReel(projectId: string) {
    try {
      // Load project
      const projectPath = path.join(this.projectsDir, `${projectId}.json`);
      const projectData = await fs.readFile(projectPath, 'utf-8');
      const project: ReelProject = JSON.parse(projectData);

      // Update status
      project.status = 'processing';
      project.progress = 10;
      await fs.writeFile(projectPath, JSON.stringify(project, null, 2));

      // Generate voice narration
      if (project.script) {
        const voicePath = path.join(this.projectsDir, `${projectId}_voice.wav`);
        await this.generateVoice(project.script, project.voiceSettings, voicePath);
        project.progress = 40;
        await fs.writeFile(projectPath, JSON.stringify(project, null, 2));
      }

      // Create video
      project.progress = 60;
      await fs.writeFile(projectPath, JSON.stringify(project, null, 2));
      
      const outputPath = await this.createReel(project);
      
      // Update project status
      project.status = 'completed';
      project.outputPath = outputPath;
      project.progress = 100;
      await fs.writeFile(projectPath, JSON.stringify(project, null, 2));

      return project;
    } catch (error: any) {
      // Update error status
      const projectPath = path.join(this.projectsDir, `${projectId}.json`);
      try {
        const projectData = await fs.readFile(projectPath, 'utf-8');
        const project = JSON.parse(projectData);
        project.status = 'error';
        await fs.writeFile(projectPath, JSON.stringify(project, null, 2));
      } catch (e: any) {
        // Ignore if can't update status
      }
      
      throw new Error(`Reel generation failed: ${error.message}`);
    }
  }

  // Get all projects
  async getProjects() {
    try {
      const files = await fs.readdir(this.projectsDir);
      const projects = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const projectData = await fs.readFile(path.join(this.projectsDir, file), 'utf-8');
          projects.push(JSON.parse(projectData));
        }
      }

      return projects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error: any) {
      return [];
    }
  }

  // Get project by ID
  async getProject(projectId: string) {
    try {
      const projectPath = path.join(this.projectsDir, `${projectId}.json`);
      const projectData = await fs.readFile(projectPath, 'utf-8');
      return JSON.parse(projectData);
    } catch (error: any) {
      throw new Error(`Project not found: ${projectId}`);
    }
  }

  // Delete project
  async deleteProject(projectId: string) {
    try {
      const projectPath = path.join(this.projectsDir, `${projectId}.json`);
      const voicePath = path.join(this.projectsDir, `${projectId}_voice.wav`);
      const outputPath = path.join(this.outputDir, `${projectId}_reel.mp4`);

      // Delete files
      await fs.unlink(projectPath).catch(() => {});
      await fs.unlink(voicePath).catch(() => {});
      await fs.unlink(outputPath).catch(() => {});

      return { success: true };
    } catch (error: any) {
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  }

  // Get project templates
  getTemplates() {
    return [
      {
        id: 'modern_tech',
        name: 'Modern Tech',
        style: 'modern',
        description: 'Clean, minimal design perfect for tech products',
        defaultSettings: {
          aspectRatio: '9:16',
          duration: 15,
          voiceSettings: {
            language: 'en',
            speed: 1.0,
            pitch: 0,
            voice: 'neutral'
          },
          captionSettings: {
            enabled: true,
            style: 'minimal',
            position: 'bottom',
            fontSize: 48,
            color: 'white'
          },
          musicSettings: {
            enabled: true,
            genre: 'ambient',
            volume: 0.3
          }
        }
      },
      {
        id: 'educational',
        name: 'Educational Content',
        style: 'educational',
        description: 'Clear, informative style for tutorials and learning',
        defaultSettings: {
          aspectRatio: '16:9',
          duration: 30,
          voiceSettings: {
            language: 'en',
            speed: 0.9,
            pitch: 0,
            voice: 'professional'
          },
          captionSettings: {
            enabled: true,
            style: 'professional',
            position: 'bottom',
            fontSize: 44,
            color: 'white'
          },
          musicSettings: {
            enabled: false,
            genre: 'none',
            volume: 0
          }
        }
      },
      {
        id: 'business_promo',
        name: 'Business Promotion',
        style: 'business',
        description: 'Professional style for business and corporate content',
        defaultSettings: {
          aspectRatio: '1:1',
          duration: 20,
          voiceSettings: {
            language: 'en',
            speed: 1.1,
            pitch: 1,
            voice: 'confident'
          },
          captionSettings: {
            enabled: true,
            style: 'bold',
            position: 'center',
            fontSize: 52,
            color: '#FFD700'
          },
          musicSettings: {
            enabled: true,
            genre: 'corporate',
            volume: 0.4
          }
        }
      },
      {
        id: 'cinematic',
        name: 'Cinematic Style',
        style: 'cinematic',
        description: 'Dramatic, high-impact style for storytelling',
        defaultSettings: {
          aspectRatio: '16:9',
          duration: 25,
          voiceSettings: {
            language: 'en',
            speed: 0.8,
            pitch: -1,
            voice: 'dramatic'
          },
          captionSettings: {
            enabled: true,
            style: 'creative',
            position: 'center',
            fontSize: 56,
            color: '#FF6B6B'
          },
          musicSettings: {
            enabled: true,
            genre: 'cinematic',
            volume: 0.5
          }
        }
      }
    ];
  }
}

export const reelEditorService = new ReelEditorService();