#!/usr/bin/env python3
"""
Content Automation Service for MO APP DEVELOPMENT Phase 2
Handles reel creation, voice synthesis, and video processing
"""

import os
import sys
from pathlib import Path
from typing import Dict, Any, List, Optional
import json
import subprocess

# Core libraries for content creation
try:
    from moviepy.editor import VideoFileClip, AudioFileClip, CompositeVideoClip, TextClip
    from gtts import gTTS
    from pydub import AudioSegment
    import cv2
    import numpy as np
    from PIL import Image, ImageDraw, ImageFont
    import aiohttp
    import asyncio
except ImportError as e:
    print(f"Missing required library: {e}")
    print("Run: pip install moviepy gtts pydub opencv-python pillow aiohttp numpy")
    sys.exit(1)

class ContentAutomation:
    """Main class for content automation and generation"""
    
    def __init__(self, work_dir: str = "./content_workspace"):
        self.work_dir = Path(work_dir)
        self.work_dir.mkdir(exist_ok=True)
        
        # Content directories
        self.video_dir = self.work_dir / "videos"
        self.audio_dir = self.work_dir / "audio"
        self.image_dir = self.work_dir / "images"
        self.output_dir = self.work_dir / "output"
        
        for directory in [self.video_dir, self.audio_dir, self.image_dir, self.output_dir]:
            directory.mkdir(exist_ok=True)
    
    def generate_voice(self, text: str, language: str = 'en', output_name: str = None) -> str:
        """Generate voice audio from text using gTTS"""
        try:
            if not output_name:
                output_name = f"voice_{hash(text) % 10000}.mp3"
            
            output_path = self.audio_dir / output_name
            
            # Generate TTS
            tts = gTTS(text=text, lang=language, slow=False)
            tts.save(str(output_path))
            
            return str(output_path)
        except Exception as e:
            print(f"Voice generation error: {e}")
            return None
    
    def create_text_overlay(self, text: str, video_path: str, output_name: str = None) -> str:
        """Add text overlay to video"""
        try:
            if not output_name:
                output_name = f"captioned_{Path(video_path).stem}.mp4"
            
            output_path = self.output_dir / output_name
            
            # Load video
            video = VideoFileClip(video_path)
            
            # Create text clip
            txt_clip = TextClip(
                text,
                fontsize=30,
                color='white',
                font='Arial-Bold',
                stroke_color='black',
                stroke_width=2
            ).set_position(('center', 'bottom')).set_duration(video.duration)
            
            # Composite video with text
            final_video = CompositeVideoClip([video, txt_clip])
            final_video.write_videofile(str(output_path), codec='libx264', audio_codec='aac')
            
            # Clean up
            video.close()
            final_video.close()
            
            return str(output_path)
        except Exception as e:
            print(f"Text overlay error: {e}")
            return None
    
    def create_reel_from_images(self, image_paths: List[str], audio_path: str = None, 
                               duration_per_image: float = 2.0, output_name: str = None) -> str:
        """Create reel from multiple images with optional audio"""
        try:
            if not output_name:
                output_name = f"reel_{len(image_paths)}_images.mp4"
            
            output_path = self.output_dir / output_name
            
            clips = []
            for img_path in image_paths:
                # Create video clip from image
                clip = VideoFileClip(img_path).set_duration(duration_per_image)
                clips.append(clip)
            
            # Concatenate all clips
            final_video = concatenate_videoclips(clips, method="compose")
            
            # Add audio if provided
            if audio_path and os.path.exists(audio_path):
                audio = AudioFileClip(audio_path)
                if audio.duration > final_video.duration:
                    audio = audio.subclip(0, final_video.duration)
                final_video = final_video.set_audio(audio)
            
            # Write final video
            final_video.write_videofile(str(output_path), codec='libx264', audio_codec='aac')
            
            # Clean up
            for clip in clips:
                clip.close()
            final_video.close()
            
            return str(output_path)
        except Exception as e:
            print(f"Reel creation error: {e}")
            return None
    
    def process_command(self, command: Dict[str, Any]) -> Dict[str, Any]:
        """Process automation command from the main app"""
        command_type = command.get("type")
        
        if command_type == "generate_voice":
            result = self.generate_voice(
                text=command.get("text"),
                language=command.get("language", "en")
            )
            return {"success": bool(result), "output_path": result}
        
        elif command_type == "create_reel":
            result = self.create_reel_from_images(
                image_paths=command.get("images", []),
                audio_path=command.get("audio"),
                duration_per_image=command.get("duration", 2.0)
            )
            return {"success": bool(result), "output_path": result}
        
        elif command_type == "add_caption":
            result = self.create_text_overlay(
                text=command.get("text"),
                video_path=command.get("video_path")
            )
            return {"success": bool(result), "output_path": result}
        
        else:
            return {"success": False, "error": f"Unknown command type: {command_type}"}
    
    async def batch_process(self, commands: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Process multiple commands asynchronously"""
        results = []
        for command in commands:
            result = self.process_command(command)
            results.append(result)
        return results

# CLI Interface
def main():
    """Command line interface for content automation"""
    if len(sys.argv) < 2:
        print("Usage: python content-automation.py <command_json>")
        print("Example: python content-automation.py '{\"type\": \"generate_voice\", \"text\": \"Hello World\"}'")
        return
    
    try:
        command = json.loads(sys.argv[1])
        automation = ContentAutomation()
        result = automation.process_command(command)
        print(json.dumps(result, indent=2))
    except json.JSONDecodeError:
        print("Error: Invalid JSON command")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()