#!/usr/bin/env python3
"""
AI-Powered Reel + Voice Automation Service
Handles video creation, voice synthesis, and content processing
"""

import os
import json
import asyncio
from pathlib import Path
from typing import List, Dict, Optional, Union
import tempfile
import logging

# Import required libraries
try:
    from moviepy.editor import (
        VideoFileClip, ImageClip, CompositeVideoClip, 
        concatenate_videoclips, ColorClip, TextClip
    )
    from moviepy.audio.io.AudioFileClip import AudioFileClip
    from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageFilter
    import numpy as np
    from gtts import gTTS
    import cv2
    from pydub import AudioSegment
    import requests
except ImportError as e:
    logging.error(f"Required library not installed: {e}")
    raise

class ReelAutomationService:
    """Advanced reel creation service with AI voice synthesis"""
    
    def __init__(self):
        self.output_dir = Path("./generated_content")
        self.temp_dir = Path(tempfile.gettempdir()) / "mo_reels"
        self.assets_dir = Path("./assets")
        
        # Create necessary directories
        for directory in [self.output_dir, self.temp_dir, self.assets_dir]:
            directory.mkdir(parents=True, exist_ok=True)
        
        self.setup_logging()
        
        # Voice synthesis settings
        self.voice_settings = {
            "natural": {"lang": "en", "tld": "com", "slow": False},
            "professional": {"lang": "en", "tld": "co.uk", "slow": False},
            "friendly": {"lang": "en", "tld": "ca", "slow": False},
            "energetic": {"lang": "en", "tld": "com.au", "slow": False}
        }
        
        # Style templates
        self.style_templates = {
            "modern": {
                "bg_color": (15, 15, 25),
                "accent_color": (139, 69, 255),
                "font_color": (255, 255, 255),
                "animation": "fade"
            },
            "tech": {
                "bg_color": (0, 20, 40),
                "accent_color": (0, 255, 200),
                "font_color": (255, 255, 255),
                "animation": "slide"
            },
            "educational": {
                "bg_color": (240, 245, 250),
                "accent_color": (59, 130, 246),
                "font_color": (30, 41, 59),
                "animation": "zoom"
            },
            "business": {
                "bg_color": (20, 30, 40),
                "accent_color": (220, 180, 60),
                "font_color": (255, 255, 255),
                "animation": "professional"
            }
        }
    
    def setup_logging(self):
        """Setup logging configuration"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(self.output_dir / 'reel_automation.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    async def generate_voice_narration(
        self, 
        script: str, 
        voice_type: str = "natural",
        speed: float = 1.0
    ) -> str:
        """
        Generate AI voice narration from script
        
        Args:
            script: Text to convert to speech
            voice_type: Type of voice (natural, professional, friendly, energetic)
            speed: Speech speed multiplier
            
        Returns:
            Path to generated audio file
        """
        try:
            self.logger.info(f"Generating voice narration: {voice_type}")
            
            voice_config = self.voice_settings.get(voice_type, self.voice_settings["natural"])
            
            # Generate speech using gTTS
            tts = gTTS(
                text=script,
                lang=voice_config["lang"],
                tld=voice_config["tld"],
                slow=voice_config["slow"]
            )
            
            # Save to temporary file
            temp_audio_path = self.temp_dir / f"narration_{hash(script)}.mp3"
            tts.save(str(temp_audio_path))
            
            # Adjust speed if needed
            if speed != 1.0:
                audio = AudioSegment.from_mp3(str(temp_audio_path))
                
                # Speed adjustment
                if speed > 1.0:
                    # Increase speed
                    audio = audio.speedup(playback_speed=speed)
                else:
                    # Decrease speed  
                    audio = audio._spawn(audio.raw_data, overrides={
                        "frame_rate": int(audio.frame_rate * speed)
                    })
                    audio = audio.set_frame_rate(audio.frame_rate)
                
                # Save adjusted audio
                final_audio_path = self.temp_dir / f"narration_final_{hash(script)}.mp3"
                audio.export(str(final_audio_path), format="mp3")
                return str(final_audio_path)
            
            return str(temp_audio_path)
            
        except Exception as e:
            self.logger.error(f"Error generating voice narration: {e}")
            raise
    
    def create_text_overlay(
        self, 
        text: str, 
        size: tuple = (1080, 1920),
        style: str = "modern",
        position: str = "center"
    ) -> ImageClip:
        """
        Create animated text overlay for video
        
        Args:
            text: Text content
            size: Video dimensions (width, height)
            style: Visual style template
            position: Text position (center, bottom, top)
            
        Returns:
            MoviePy ImageClip with text
        """
        try:
            style_config = self.style_templates.get(style, self.style_templates["modern"])
            
            # Create background
            img = Image.new('RGBA', size, color=(*style_config["bg_color"], 0))
            draw = ImageDraw.Draw(img)
            
            # Load font (fallback to default if custom font not available)
            try:
                font_size = max(40, size[0] // 25)
                font = ImageFont.truetype("arial.ttf", font_size)
            except:
                font = ImageFont.load_default()
            
            # Calculate text position
            bbox = draw.textbbox((0, 0), text, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
            
            if position == "center":
                x = (size[0] - text_width) // 2
                y = (size[1] - text_height) // 2
            elif position == "bottom":
                x = (size[0] - text_width) // 2
                y = size[1] - text_height - 100
            else:  # top
                x = (size[0] - text_width) // 2
                y = 100
            
            # Add text with outline
            outline_color = (0, 0, 0, 200)
            for adj in range(3):
                draw.text((x-adj, y-adj), text, font=font, fill=outline_color)
                draw.text((x+adj, y+adj), text, font=font, fill=outline_color)
            
            # Main text
            draw.text((x, y), text, font=font, fill=(*style_config["font_color"], 255))
            
            # Convert PIL to numpy array for MoviePy
            img_array = np.array(img)
            
            # Create ImageClip
            text_clip = ImageClip(img_array, ismask=False, transparent=True)
            
            return text_clip
            
        except Exception as e:
            self.logger.error(f"Error creating text overlay: {e}")
            raise
    
    def enhance_image(self, image_path: str, style: str = "modern") -> str:
        """
        Enhance uploaded images with style-specific filters
        
        Args:
            image_path: Path to input image
            style: Enhancement style
            
        Returns:
            Path to enhanced image
        """
        try:
            style_config = self.style_templates.get(style, self.style_templates["modern"])
            
            # Load image
            img = Image.open(image_path)
            
            # Resize to fit reel format (9:16)
            target_width = 1080
            target_height = 1920
            
            # Calculate crop/resize dimensions
            img_ratio = img.width / img.height
            target_ratio = target_width / target_height
            
            if img_ratio > target_ratio:
                # Image is wider, crop width
                new_height = img.height
                new_width = int(new_height * target_ratio)
                left = (img.width - new_width) // 2
                img = img.crop((left, 0, left + new_width, new_height))
            else:
                # Image is taller, crop height
                new_width = img.width
                new_height = int(new_width / target_ratio)
                top = (img.height - new_height) // 2
                img = img.crop((0, top, new_width, top + new_height))
            
            # Resize to target dimensions
            img = img.resize((target_width, target_height), Image.Resampling.LANCZOS)
            
            # Apply style-specific enhancements
            if style == "modern":
                # Increase contrast and saturation
                enhancer = ImageEnhance.Contrast(img)
                img = enhancer.enhance(1.2)
                enhancer = ImageEnhance.Color(img)
                img = enhancer.enhance(1.1)
            elif style == "tech":
                # Add blue tint and increase sharpness
                img = img.convert('RGB')
                enhancer = ImageEnhance.Color(img)
                img = enhancer.enhance(0.8)  # Reduce saturation
                enhancer = ImageEnhance.Sharpness(img)
                img = enhancer.enhance(1.3)
            elif style == "educational":
                # Soften and brighten
                img = img.filter(ImageFilter.GaussianBlur(radius=0.5))
                enhancer = ImageEnhance.Brightness(img)
                img = enhancer.enhance(1.1)
            
            # Save enhanced image
            enhanced_path = self.temp_dir / f"enhanced_{Path(image_path).name}"
            img.save(str(enhanced_path), quality=95)
            
            return str(enhanced_path)
            
        except Exception as e:
            self.logger.error(f"Error enhancing image: {e}")
            raise
    
    async def create_reel(
        self,
        project_data: Dict,
        media_files: List[str] = None
    ) -> str:
        """
        Create complete reel with voice narration and media
        
        Args:
            project_data: Project configuration
            media_files: List of media file paths
            
        Returns:
            Path to generated reel video
        """
        try:
            self.logger.info(f"Creating reel: {project_data.get('name', 'Untitled')}")
            
            # Extract configuration
            script = project_data.get('script', '')
            duration = project_data.get('duration', 30)
            voice_type = project_data.get('voiceType', 'natural')
            style = project_data.get('style', 'modern')
            music_type = project_data.get('musicType', 'none')
            
            # Generate voice narration
            audio_path = await self.generate_voice_narration(script, voice_type)
            
            # Get audio duration to sync with video
            audio_clip = AudioFileClip(audio_path)
            actual_duration = min(audio_clip.duration, duration)
            
            clips = []
            
            # Process media files if provided
            if media_files:
                for i, media_file in enumerate(media_files):
                    if media_file.lower().endswith(('.jpg', '.jpeg', '.png', '.gif')):
                        # Image processing
                        enhanced_path = self.enhance_image(media_file, style)
                        img_clip = ImageClip(enhanced_path)
                        img_clip = img_clip.set_duration(actual_duration / len(media_files))
                        clips.append(img_clip)
                    elif media_file.lower().endswith(('.mp4', '.mov', '.avi')):
                        # Video processing
                        vid_clip = VideoFileClip(media_file)
                        vid_clip = vid_clip.resize((1080, 1920))
                        vid_clip = vid_clip.set_duration(actual_duration / len(media_files))
                        clips.append(vid_clip)
            
            # If no media files, create background
            if not clips:
                style_config = self.style_templates[style]
                bg_clip = ColorClip(
                    size=(1080, 1920), 
                    color=style_config["bg_color"], 
                    duration=actual_duration
                )
                clips.append(bg_clip)
            
            # Concatenate or composite clips
            if len(clips) == 1:
                main_clip = clips[0]
            else:
                main_clip = concatenate_videoclips(clips)
            
            # Add text overlays with script segments
            words = script.split()
            words_per_segment = max(1, len(words) // 3)  # 3 text overlays
            segment_duration = actual_duration / 3
            
            text_clips = []
            for i in range(3):
                start_word = i * words_per_segment
                end_word = min((i + 1) * words_per_segment, len(words))
                segment_text = ' '.join(words[start_word:end_word])
                
                if segment_text.strip():
                    text_overlay = self.create_text_overlay(
                        segment_text, 
                        style=style,
                        position="bottom" if i == 0 else ("center" if i == 1 else "top")
                    )
                    text_overlay = text_overlay.set_duration(segment_duration)
                    text_overlay = text_overlay.set_start(i * segment_duration)
                    text_clips.append(text_overlay)
            
            # Composite all elements
            if text_clips:
                final_clip = CompositeVideoClip([main_clip] + text_clips)
            else:
                final_clip = main_clip
            
            # Add audio
            final_clip = final_clip.set_audio(audio_clip)
            
            # Generate output filename
            project_name = project_data.get('name', 'reel').replace(' ', '_')
            output_filename = f"{project_name}_{hash(script)}.mp4"
            output_path = self.output_dir / output_filename
            
            # Export video
            self.logger.info(f"Exporting reel to: {output_path}")
            final_clip.write_videofile(
                str(output_path),
                fps=30,
                codec='libx264',
                audio_codec='aac',
                temp_audiofile=str(self.temp_dir / 'temp_audio.m4a'),
                remove_temp=True
            )
            
            # Cleanup
            audio_clip.close()
            final_clip.close()
            
            self.logger.info(f"Reel created successfully: {output_path}")
            return str(output_path)
            
        except Exception as e:
            self.logger.error(f"Error creating reel: {e}")
            raise
    
    def generate_thumbnail(self, video_path: str) -> str:
        """
        Generate thumbnail for created reel
        
        Args:
            video_path: Path to video file
            
        Returns:
            Path to thumbnail image
        """
        try:
            # Load video and extract frame
            clip = VideoFileClip(video_path)
            
            # Get frame at 25% of video duration
            frame_time = clip.duration * 0.25
            frame = clip.get_frame(frame_time)
            
            # Convert to PIL Image
            thumbnail = Image.fromarray(frame.astype('uint8'), 'RGB')
            
            # Resize for thumbnail
            thumbnail.thumbnail((300, 533), Image.Resampling.LANCZOS)
            
            # Save thumbnail
            thumbnail_path = video_path.replace('.mp4', '_thumbnail.jpg')
            thumbnail.save(thumbnail_path, quality=85)
            
            clip.close()
            return thumbnail_path
            
        except Exception as e:
            self.logger.error(f"Error generating thumbnail: {e}")
            return ""
    
    async def process_reel_request(self, request_data: Dict) -> Dict:
        """
        Main entry point for reel processing requests
        
        Args:
            request_data: Complete request with project data and media
            
        Returns:
            Processing result with output paths
        """
        try:
            project_data = request_data.get('project', {})
            media_files = request_data.get('media_files', [])
            
            # Create the reel
            video_path = await self.create_reel(project_data, media_files)
            
            # Generate thumbnail
            thumbnail_path = self.generate_thumbnail(video_path)
            
            return {
                "success": True,
                "video_path": video_path,
                "thumbnail_path": thumbnail_path,
                "duration": project_data.get('duration', 30),
                "message": "Reel created successfully with AI voice narration"
            }
            
        except Exception as e:
            self.logger.error(f"Error processing reel request: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to create reel"
            }

# Initialize service
reel_service = ReelAutomationService()

async def main():
    """Example usage of the reel automation service"""
    
    # Example project data
    sample_project = {
        "name": "MO APP Demo Reel",
        "script": "Transform your mobile development workflow with MO APP. Create stunning applications directly from your phone using our AI-powered automation tools. Join thousands of developers who have revolutionized their coding experience.",
        "duration": 30,
        "voiceType": "professional",
        "style": "tech",
        "musicType": "upbeat"
    }
    
    # Process the reel
    result = await reel_service.process_reel_request({
        "project": sample_project,
        "media_files": []  # Add media file paths here
    })
    
    print(f"Reel creation result: {result}")

if __name__ == "__main__":
    asyncio.run(main())