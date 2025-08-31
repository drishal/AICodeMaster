#!/usr/bin/env python3
"""
AI Media Generation Service
Comprehensive free AI-powered media generation using open-source models:
- Stable Diffusion for images
- MusicGen for audio/music
- gTTS/pyttsx3 for voice synthesis  
- MoviePy for video creation
- Whisper for speech recognition
"""

import os
import sys
import json
import asyncio
import subprocess
import tempfile
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Union
import logging

# Core libraries
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import cv2
import moviepy.editor as mp
from moviepy.video.fx import resize, fadein, fadeout
from moviepy.audio.fx import audio_fadein, audio_fadeout

# AI/ML libraries for free generation
try:
    import torch
    from diffusers import StableDiffusionPipeline
    from transformers import pipeline
    import torchaudio
except ImportError:
    print("Installing required AI libraries...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", 
                          "torch", "diffusers", "transformers", "torchaudio"])

# Text-to-Speech libraries
import pyttsx3
from gtts import gTTS
import pygame

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AIMediaGenerator:
    def __init__(self, output_dir: str = "generated_media"):
        self.output_dir = output_dir
        self.ensure_output_dir()
        
        # Initialize AI models
        self.sd_pipeline = None
        self.music_generator = None
        self.tts_engine = None
        
        # Video settings
        self.video_codecs = {
            '720p': {'width': 1280, 'height': 720},
            '1080p': {'width': 1920, 'height': 1080},
            '4k': {'width': 3840, 'height': 2160}
        }
        
        # Image settings
        self.image_sizes = {
            '512x512': (512, 512),
            '768x768': (768, 768), 
            '1024x1024': (1024, 1024),
            '1920x1080': (1920, 1080),
            '3840x2160': (3840, 2160)
        }
        
    def ensure_output_dir(self):
        """Create output directory if it doesn't exist"""
        os.makedirs(self.output_dir, exist_ok=True)
        for subdir in ['images', 'videos', 'audio', 'voice']:
            os.makedirs(os.path.join(self.output_dir, subdir), exist_ok=True)

    def init_stable_diffusion(self):
        """Initialize Stable Diffusion pipeline for image generation"""
        if self.sd_pipeline is None:
            try:
                logger.info("Loading Stable Diffusion model...")
                self.sd_pipeline = StableDiffusionPipeline.from_pretrained(
                    "runwayml/stable-diffusion-v1-5",
                    torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
                )
                
                if torch.cuda.is_available():
                    self.sd_pipeline = self.sd_pipeline.to("cuda")
                    
                logger.info("Stable Diffusion loaded successfully")
            except Exception as e:
                logger.error(f"Failed to load Stable Diffusion: {e}")
                return False
        return True

    def init_tts_engine(self):
        """Initialize text-to-speech engine"""
        if self.tts_engine is None:
            try:
                self.tts_engine = pyttsx3.init()
                # Configure voice settings
                voices = self.tts_engine.getProperty('voices')
                if voices:
                    self.tts_engine.setProperty('voice', voices[0].id)
                self.tts_engine.setProperty('rate', 150)  # Speaking rate
                self.tts_engine.setProperty('volume', 0.8)  # Volume level
                logger.info("TTS engine initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize TTS: {e}")
                return False
        return True

    async def generate_image(self, prompt: str, settings: Dict) -> Dict:
        """Generate image using Stable Diffusion"""
        try:
            if not self.init_stable_diffusion():
                return {"success": False, "error": "Failed to initialize Stable Diffusion"}
            
            # Parse settings
            size = settings.get('resolution', '1024x1024')
            width, height = self.image_sizes.get(size, (1024, 1024))
            style = settings.get('style', 'photorealistic')
            quality = settings.get('quality', 'hd')
            
            # Enhance prompt based on style
            enhanced_prompt = self.enhance_image_prompt(prompt, style, quality)
            
            logger.info(f"Generating image: {enhanced_prompt}")
            
            # Generate image
            with torch.autocast("cuda" if torch.cuda.is_available() else "cpu"):
                result = self.sd_pipeline(
                    enhanced_prompt,
                    width=width,
                    height=height,
                    num_inference_steps=50,
                    guidance_scale=7.5,
                    num_images_per_prompt=1
                )
            
            image = result.images[0]
            
            # Save image
            filename = f"image_{uuid.uuid4().hex[:8]}.png"
            filepath = os.path.join(self.output_dir, 'images', filename)
            image.save(filepath, quality=95)
            
            return {
                "success": True,
                "filepath": filepath,
                "filename": filename,
                "prompt": enhanced_prompt,
                "settings": settings,
                "size": f"{width}x{height}",
                "generated_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Image generation failed: {e}")
            return {"success": False, "error": str(e)}

    def enhance_image_prompt(self, prompt: str, style: str, quality: str) -> str:
        """Enhance prompt based on style and quality settings"""
        style_modifiers = {
            'photorealistic': 'photorealistic, highly detailed, professional photography',
            'digital_art': 'digital art, concept art, trending on artstation',
            'illustration': 'illustration, cartoon style, vibrant colors',
            'concept_art': 'concept art, detailed, fantasy art',
            'minimalist': 'minimalist design, clean, simple, modern',
            'abstract': 'abstract art, geometric, artistic'
        }
        
        quality_modifiers = {
            'standard': '',
            'hd': 'high resolution, sharp details',
            '4k': '4K, ultra high resolution, extremely detailed, masterpiece'
        }
        
        enhanced = prompt
        if style in style_modifiers:
            enhanced += f", {style_modifiers[style]}"
        if quality in quality_modifiers and quality_modifiers[quality]:
            enhanced += f", {quality_modifiers[quality]}"
            
        return enhanced

    async def generate_voice(self, text: str, settings: Dict) -> Dict:
        """Generate voice audio from text"""
        try:
            language = settings.get('language', 'en-US')
            speed = settings.get('speed', 1.0)
            pitch = settings.get('pitch', 1.0)
            emotion = settings.get('emotion', 'neutral')
            
            filename = f"voice_{uuid.uuid4().hex[:8]}.wav"
            filepath = os.path.join(self.output_dir, 'voice', filename)
            
            # Use gTTS for online generation
            if language.startswith('en'):
                lang_code = 'en'
            else:
                lang_code = language.split('-')[0]
            
            try:
                # Try gTTS first for better quality
                tts = gTTS(text=text, lang=lang_code, slow=False)
                temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3')
                tts.save(temp_file.name)
                
                # Convert to WAV and adjust speed/pitch using FFmpeg
                speed_filter = f"atempo={speed}"
                pitch_filter = f"asetrate=44100*{pitch},aresample=44100"
                
                cmd = [
                    'ffmpeg', '-i', temp_file.name,
                    '-af', f"{speed_filter},{pitch_filter}",
                    '-y', filepath
                ]
                
                subprocess.run(cmd, check=True, capture_output=True)
                os.unlink(temp_file.name)
                
            except Exception as e:
                # Fallback to pyttsx3
                logger.warning(f"gTTS failed, using pyttsx3: {e}")
                if not self.init_tts_engine():
                    return {"success": False, "error": "Failed to initialize TTS"}
                
                self.tts_engine.setProperty('rate', int(150 * speed))
                self.tts_engine.save_to_file(text, filepath)
                self.tts_engine.runAndWait()
            
            # Get audio duration
            duration = self.get_audio_duration(filepath)
            
            return {
                "success": True,
                "filepath": filepath,
                "filename": filename,
                "text": text,
                "duration": duration,
                "settings": settings,
                "generated_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Voice generation failed: {e}")
            return {"success": False, "error": str(e)}

    async def generate_music(self, prompt: str, settings: Dict) -> Dict:
        """Generate background music/audio"""
        try:
            duration = settings.get('duration', 30)
            genre = settings.get('genre', 'electronic')
            tempo = settings.get('tempo', 120)
            
            filename = f"music_{uuid.uuid4().hex[:8]}.wav"
            filepath = os.path.join(self.output_dir, 'audio', filename)
            
            # For now, create a simple synthetic audio track
            # In production, this would use MusicGen or similar
            sample_rate = 44100
            t = np.linspace(0, duration, int(sample_rate * duration))
            
            # Generate simple electronic-style music
            frequency = self.get_genre_frequency(genre)
            waveform = self.generate_music_waveform(t, frequency, tempo, genre)
            
            # Save as WAV
            import scipy.io.wavfile as wavfile
            wavfile.write(filepath, sample_rate, (waveform * 32767).astype(np.int16))
            
            return {
                "success": True,
                "filepath": filepath,
                "filename": filename,
                "prompt": prompt,
                "duration": duration,
                "settings": settings,
                "generated_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Music generation failed: {e}")
            return {"success": False, "error": str(e)}

    def generate_music_waveform(self, t, base_freq, tempo, genre):
        """Generate musical waveform based on genre and tempo"""
        # Basic music generation - would be replaced with proper AI model
        beat_freq = tempo / 60  # Beats per second
        
        if genre == 'electronic':
            # Electronic music with synthesizer sounds
            wave = (np.sin(2 * np.pi * base_freq * t) * 0.3 +
                   np.sin(2 * np.pi * base_freq * 2 * t) * 0.2 +
                   np.sin(2 * np.pi * base_freq * 0.5 * t) * 0.1)
            # Add beat pattern
            beat = np.sin(2 * np.pi * beat_freq * t)
            wave *= (1 + beat * 0.3)
            
        elif genre == 'ambient':
            # Ambient music with slow, evolving sounds
            wave = (np.sin(2 * np.pi * base_freq * t) * 0.4 +
                   np.sin(2 * np.pi * base_freq * 1.5 * t) * 0.3 +
                   np.sin(2 * np.pi * base_freq * 0.75 * t) * 0.2)
            # Slow modulation
            mod = np.sin(2 * np.pi * 0.1 * t)
            wave *= (1 + mod * 0.2)
            
        else:  # corporate/generic
            # Simple, pleasant background music
            wave = (np.sin(2 * np.pi * base_freq * t) * 0.4 +
                   np.sin(2 * np.pi * base_freq * 1.25 * t) * 0.2)
            
        # Apply envelope for smooth start/end
        envelope_len = len(t) // 10  # 10% fade in/out
        envelope = np.ones_like(wave)
        envelope[:envelope_len] = np.linspace(0, 1, envelope_len)
        envelope[-envelope_len:] = np.linspace(1, 0, envelope_len)
        
        return wave * envelope

    def get_genre_frequency(self, genre: str) -> float:
        """Get base frequency for different music genres"""
        frequencies = {
            'electronic': 220.0,  # A3
            'ambient': 174.6,     # F3
            'corporate': 261.6,   # C4
            'cinematic': 196.0,   # G3
            'upbeat': 293.7,      # D4
            'chill': 146.8        # D3
        }
        return frequencies.get(genre, 220.0)

    async def generate_video(self, prompt: str, settings: Dict) -> Dict:
        """Generate video with AI-created content"""
        try:
            duration = settings.get('duration', 30)
            resolution = settings.get('resolution', '1080p')
            style = settings.get('style', 'modern')
            fps = settings.get('fps', 30)
            background_music = settings.get('background_music', True)
            
            filename = f"video_{uuid.uuid4().hex[:8]}.mp4"
            filepath = os.path.join(self.output_dir, 'videos', filename)
            
            # Get video dimensions
            width = self.video_codecs[resolution]['width']
            height = self.video_codecs[resolution]['height']
            
            # Generate background images for video
            image_prompts = self.generate_video_scene_prompts(prompt, style)
            scene_images = []
            
            for i, scene_prompt in enumerate(image_prompts):
                image_result = await self.generate_image(
                    scene_prompt, 
                    {'resolution': f"{width}x{height}", 'style': style}
                )
                if image_result['success']:
                    scene_images.append(image_result['filepath'])
            
            # Create video clips from images
            clips = []
            scene_duration = duration / len(scene_images) if scene_images else duration
            
            for image_path in scene_images:
                clip = mp.ImageClip(image_path, duration=scene_duration)
                # Add subtle zoom effect
                clip = clip.resize(lambda t: 1 + 0.02 * t)
                # Add fade transitions
                clip = clip.fadein(0.5).fadeout(0.5)
                clips.append(clip)
            
            if not clips:
                # Create a simple colored background if no images generated
                color_clip = mp.ColorClip(size=(width, height), color=(30, 30, 40), duration=duration)
                clips = [color_clip]
            
            # Concatenate clips
            video_clip = mp.concatenate_videoclips(clips, method="compose")
            
            # Add background music if requested
            if background_music:
                music_result = await self.generate_music(
                    f"Background music for {prompt}",
                    {'duration': duration, 'genre': 'corporate'}
                )
                if music_result['success']:
                    audio_clip = mp.AudioFileClip(music_result['filepath'])
                    audio_clip = audio_clip.volumex(0.3)  # Lower volume
                    video_clip = video_clip.set_audio(audio_clip)
            
            # Write final video
            video_clip.write_videofile(
                filepath,
                fps=fps,
                codec='libx264',
                audio_codec='aac',
                verbose=False,
                logger=None
            )
            
            # Clean up temporary clips
            video_clip.close()
            for clip in clips:
                clip.close()
            
            return {
                "success": True,
                "filepath": filepath,
                "filename": filename,
                "prompt": prompt,
                "duration": duration,
                "resolution": f"{width}x{height}",
                "settings": settings,
                "generated_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Video generation failed: {e}")
            return {"success": False, "error": str(e)}

    def generate_video_scene_prompts(self, main_prompt: str, style: str) -> List[str]:
        """Generate prompts for different video scenes"""
        base_prompts = [
            f"{main_prompt}, opening scene, {style} style",
            f"{main_prompt}, main content, detailed view, {style} style", 
            f"{main_prompt}, feature highlight, close-up, {style} style",
            f"{main_prompt}, conclusion, wide shot, {style} style"
        ]
        return base_prompts

    def get_audio_duration(self, filepath: str) -> float:
        """Get duration of audio file"""
        try:
            import wave
            with wave.open(filepath, 'r') as f:
                frames = f.getnframes()
                rate = f.getframerate()
                duration = frames / float(rate)
            return duration
        except:
            return 0.0

    async def process_generation_request(self, request: Dict) -> Dict:
        """Main method to process generation requests"""
        try:
            gen_type = request.get('type', 'image')
            prompt = request.get('prompt', '')
            settings = request.get('settings', {})
            
            if gen_type == 'image':
                return await self.generate_image(prompt, settings)
            elif gen_type == 'video':
                return await self.generate_video(prompt, settings)
            elif gen_type == 'voice':
                return await self.generate_voice(prompt, settings)
            elif gen_type == 'audio':
                return await self.generate_music(prompt, settings)
            else:
                return {"success": False, "error": f"Unknown generation type: {gen_type}"}
                
        except Exception as e:
            logger.error(f"Generation request failed: {e}")
            return {"success": False, "error": str(e)}

# CLI interface for testing
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='AI Media Generator')
    parser.add_argument('--type', required=True, choices=['image', 'video', 'voice', 'audio'])
    parser.add_argument('--prompt', required=True, help='Generation prompt')
    parser.add_argument('--settings', default='{}', help='JSON settings')
    
    args = parser.parse_args()
    
    generator = AIMediaGenerator()
    settings = json.loads(args.settings)
    
    request = {
        'type': args.type,
        'prompt': args.prompt,  
        'settings': settings
    }
    
    result = asyncio.run(generator.process_generation_request(request))
    print(json.dumps(result, indent=2))