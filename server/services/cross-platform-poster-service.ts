import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface PlatformFormat {
  content: string;
  hashtags: string[];
  mediaFormat: string;
  captionLimit: number;
  specialFeatures: string[];
}

interface PostResult {
  platform: string;
  success: boolean;
  postId?: string;
  url?: string;
  error?: string;
  engagement?: {
    views?: number;
    likes?: number;
    shares?: number;
    comments?: number;
  };
}

export class CrossPlatformPosterService {
  private outputDir: string;

  constructor() {
    this.outputDir = path.join(process.cwd(), 'uploads', 'cross-platform-posts');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  // AI-powered content formatting for different platforms
  async formatContentForPlatforms(originalContent: string, mediaUrls: string[], targetPlatforms: string[]): Promise<Record<string, PlatformFormat>> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are a social media optimization expert. Format content for different platforms with their specific requirements:

            PLATFORM SPECIFICATIONS:
            - Instagram: 2200 char limit, story-focused, trending hashtags, visual-first
            - YouTube Shorts: 125 char title, engaging hooks, vertical video optimized
            - Telegram: 4096 char limit, markdown support, channel-focused
            - Facebook: 500 char optimal, engagement-focused, community building
            - Twitter: 280 char limit, trending hashtags, conversation starters
            - LinkedIn: Professional tone, 700 char optimal, industry hashtags
            - TikTok: 150 char limit, viral hooks, trending sounds/hashtags

            Return JSON with platform-specific optimized content:
            {
              "platform_name": {
                "content": "optimized text for platform",
                "hashtags": ["platform", "specific", "hashtags"],
                "mediaFormat": "required media format",
                "captionLimit": character_limit,
                "specialFeatures": ["platform specific features to use"]
              }
            }`
          },
          {
            role: "user",
            content: `Format this content for platforms [${targetPlatforms.join(', ')}]:

Original Content: "${originalContent}"
Media URLs: ${mediaUrls.join(', ')}

Optimize for maximum engagement while maintaining brand consistency.`
          }
        ],
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('Content formatting error:', error);
      // Fallback to basic formatting
      return this.basicFormatting(originalContent, targetPlatforms);
    }
  }

  // Fallback basic formatting
  private basicFormatting(content: string, platforms: string[]): Record<string, PlatformFormat> {
    const formats: Record<string, PlatformFormat> = {};
    
    platforms.forEach(platform => {
      switch (platform) {
        case 'instagram':
          formats[platform] = {
            content: content.substring(0, 2200),
            hashtags: ['#mobile', '#development', '#AI', '#automation', '#MoApp'],
            mediaFormat: 'image/video',
            captionLimit: 2200,
            specialFeatures: ['stories', 'reels', 'igtv']
          };
          break;
        case 'youtube':
          formats[platform] = {
            content: content.substring(0, 125),
            hashtags: ['#Shorts', '#MobileDev', '#AI', '#Automation'],
            mediaFormat: 'video',
            captionLimit: 125,
            specialFeatures: ['shorts', 'community_tab']
          };
          break;
        case 'telegram':
          formats[platform] = {
            content: content.substring(0, 4096),
            hashtags: ['#MobileDevelopment', '#AIAutomation', '#MoApp'],
            mediaFormat: 'any',
            captionLimit: 4096,
            specialFeatures: ['channels', 'groups', 'bots']
          };
          break;
        default:
          formats[platform] = {
            content: content.substring(0, 500),
            hashtags: ['#tech', '#mobile', '#AI'],
            mediaFormat: 'image',
            captionLimit: 500,
            specialFeatures: []
          };
      }
    });

    return formats;
  }

  // Generate trending hashtags for each platform
  async generateTrendingHashtags(content: string, platform: string): Promise<string[]> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `Generate trending hashtags for ${platform}. Focus on:
            - Current trending topics in tech/mobile development
            - Platform-specific trending hashtags
            - Niche-specific tags for better reach
            - Mix of popular and niche hashtags for optimal discoverability
            
            Return JSON array of hashtags without the # symbol:
            {"hashtags": ["hashtag1", "hashtag2", "hashtag3"]}`
          },
          {
            role: "user",
            content: `Generate trending hashtags for this content on ${platform}: "${content}"`
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result.hashtags || [];
    } catch (error) {
      console.error('Hashtag generation error:', error);
      return ['mobile', 'development', 'AI', 'automation'];
    }
  }

  // Auto-post to Instagram
  async postToInstagram(content: string, mediaUrls: string[], credentials: any): Promise<PostResult> {
    return new Promise((resolve) => {
      const pythonScript = `
import requests
import json
import sys

def post_to_instagram(content, media_urls, access_token, page_id):
    try:
        # Instagram Basic Display API posting
        url = f"https://graph.facebook.com/v18.0/{page_id}/media"
        
        params = {
            'image_url': media_urls[0] if media_urls else None,
            'caption': content,
            'access_token': access_token
        }
        
        # Create media object
        response = requests.post(url, params=params)
        if response.status_code == 200:
            media_id = response.json().get('id')
            
            # Publish media
            publish_url = f"https://graph.facebook.com/v18.0/{page_id}/media_publish"
            publish_params = {
                'creation_id': media_id,
                'access_token': access_token
            }
            
            publish_response = requests.post(publish_url, params=publish_params)
            if publish_response.status_code == 200:
                post_id = publish_response.json().get('id')
                print(json.dumps({
                    "success": True,
                    "postId": post_id,
                    "url": f"https://instagram.com/p/{post_id}"
                }))
            else:
                print(json.dumps({"success": False, "error": f"Publish failed: {publish_response.text}"}))
        else:
            print(json.dumps({"success": False, "error": f"Media creation failed: {response.text}"}))
            
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))

if __name__ == "__main__":
    post_to_instagram(
        "${content.replace(/"/g, '\\"')}", 
        ${JSON.stringify(mediaUrls)}, 
        "${credentials.accessToken || ''}", 
        "${credentials.pageId || ''}"
    )
`;

      const python = spawn('python3', ['-c', pythonScript]);
      let output = '';

      python.stdout.on('data', (data) => {
        output += data.toString();
      });

      python.on('close', (code) => {
        try {
          const result = JSON.parse(output.trim());
          resolve({
            platform: 'instagram',
            success: result.success,
            postId: result.postId,
            url: result.url,
            error: result.error
          });
        } catch {
          resolve({
            platform: 'instagram',
            success: false,
            error: 'Instagram posting failed'
          });
        }
      });
    });
  }

  // Auto-post to Telegram
  async postToTelegram(content: string, mediaUrls: string[], credentials: any): Promise<PostResult> {
    return new Promise((resolve) => {
      const pythonScript = `
import requests
import json

def post_to_telegram(content, media_urls, bot_token, chat_id):
    try:
        base_url = f"https://api.telegram.org/bot{bot_token}"
        
        if media_urls and len(media_urls) > 0:
            # Send photo with caption
            url = f"{base_url}/sendPhoto"
            data = {
                'chat_id': chat_id,
                'photo': media_urls[0],
                'caption': content,
                'parse_mode': 'HTML'
            }
        else:
            # Send text message
            url = f"{base_url}/sendMessage"
            data = {
                'chat_id': chat_id,
                'text': content,
                'parse_mode': 'HTML'
            }
        
        response = requests.post(url, data=data)
        if response.status_code == 200:
            result = response.json()
            message_id = result['result']['message_id']
            print(json.dumps({
                "success": True,
                "postId": str(message_id),
                "url": f"https://t.me/{chat_id.replace('@', '')}/{message_id}"
            }))
        else:
            print(json.dumps({"success": False, "error": f"Telegram API error: {response.text}"}))
            
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))

if __name__ == "__main__":
    post_to_telegram(
        "${content.replace(/"/g, '\\"')}", 
        ${JSON.stringify(mediaUrls)}, 
        "${credentials.botToken || ''}", 
        "${credentials.chatId || ''}"
    )
`;

      const python = spawn('python3', ['-c', pythonScript]);
      let output = '';

      python.stdout.on('data', (data) => {
        output += data.toString();
      });

      python.on('close', (code) => {
        try {
          const result = JSON.parse(output.trim());
          resolve({
            platform: 'telegram',
            success: result.success,
            postId: result.postId,
            url: result.url,
            error: result.error
          });
        } catch {
          resolve({
            platform: 'telegram',
            success: false,
            error: 'Telegram posting failed'
          });
        }
      });
    });
  }

  // Auto-post to YouTube Shorts
  async postToYouTubeShorts(content: string, videoUrl: string, credentials: any): Promise<PostResult> {
    return new Promise((resolve) => {
      const pythonScript = `
import requests
import json
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
import os

def post_to_youtube(title, description, video_path, api_key):
    try:
        youtube = build('youtube', 'v3', developerKey=api_key)
        
        # Prepare video metadata
        body = {
            'snippet': {
                'title': title,
                'description': description,
                'tags': ['shorts', 'mobile', 'development', 'AI'],
                'categoryId': '28',  # Science & Technology
                'defaultLanguage': 'en',
                'defaultAudioLanguage': 'en'
            },
            'status': {
                'privacyStatus': 'public',
                'selfDeclaredMadeForKids': False
            }
        }
        
        # Upload video
        media = MediaFileUpload(video_path, chunksize=-1, resumable=True, mimetype='video/mp4')
        
        request = youtube.videos().insert(
            part=','.join(body.keys()),
            body=body,
            media_body=media
        )
        
        response = request.execute()
        video_id = response['id']
        
        print(json.dumps({
            "success": True,
            "postId": video_id,
            "url": f"https://youtube.com/shorts/{video_id}"
        }))
        
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))

if __name__ == "__main__":
    post_to_youtube(
        "${content.substring(0, 100)}", 
        "${content}", 
        "${videoUrl}", 
        "${credentials.apiKey || ''}"
    )
`;

      const python = spawn('python3', ['-c', pythonScript]);
      let output = '';

      python.stdout.on('data', (data) => {
        output += data.toString();
      });

      python.on('close', (code) => {
        try {
          const result = JSON.parse(output.trim());
          resolve({
            platform: 'youtube',
            success: result.success,
            postId: result.postId,
            url: result.url,
            error: result.error
          });
        } catch {
          resolve({
            platform: 'youtube',
            success: false,
            error: 'YouTube posting failed'
          });
        }
      });
    });
  }

  // Auto-post to Facebook
  async postToFacebook(content: string, mediaUrls: string[], credentials: any): Promise<PostResult> {
    return new Promise((resolve) => {
      const pythonScript = `
import requests
import json

def post_to_facebook(content, media_urls, access_token, page_id):
    try:
        url = f"https://graph.facebook.com/v18.0/{page_id}/feed"
        
        data = {
            'message': content,
            'access_token': access_token
        }
        
        # Add media if available
        if media_urls and len(media_urls) > 0:
            data['link'] = media_urls[0]
        
        response = requests.post(url, data=data)
        if response.status_code == 200:
            result = response.json()
            post_id = result.get('id')
            print(json.dumps({
                "success": True,
                "postId": post_id,
                "url": f"https://facebook.com/{post_id}"
            }))
        else:
            print(json.dumps({"success": False, "error": f"Facebook API error: {response.text}"}))
            
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))

if __name__ == "__main__":
    post_to_facebook(
        "${content.replace(/"/g, '\\"')}", 
        ${JSON.stringify(mediaUrls)}, 
        "${credentials.accessToken || ''}", 
        "${credentials.pageId || ''}"
    )
`;

      const python = spawn('python3', ['-c', pythonScript]);
      let output = '';

      python.stdout.on('data', (data) => {
        output += data.toString();
      });

      python.on('close', (code) => {
        try {
          const result = JSON.parse(output.trim());
          resolve({
            platform: 'facebook',
            success: result.success,
            postId: result.postId,
            url: result.url,
            error: result.error
          });
        } catch {
          resolve({
            platform: 'facebook',
            success: false,
            error: 'Facebook posting failed'
          });
        }
      });
    });
  }

  // Master posting function
  async executeAutoPosting(
    content: string, 
    mediaUrls: string[], 
    platforms: string[], 
    platformCredentials: Record<string, any>
  ): Promise<PostResult[]> {
    const results: PostResult[] = [];
    
    // Format content for each platform
    const platformFormats = await this.formatContentForPlatforms(content, mediaUrls, platforms);
    
    // Post to each platform
    for (const platform of platforms) {
      const formatData = platformFormats[platform];
      if (!formatData) continue;
      
      const credentials = platformCredentials[platform];
      if (!credentials) {
        results.push({
          platform,
          success: false,
          error: 'No credentials configured for platform'
        });
        continue;
      }
      
      let result: PostResult;
      
      switch (platform) {
        case 'instagram':
          result = await this.postToInstagram(formatData.content, mediaUrls, credentials);
          break;
        case 'telegram':
          result = await this.postToTelegram(formatData.content, mediaUrls, credentials);
          break;
        case 'youtube':
          result = await this.postToYouTubeShorts(formatData.content, mediaUrls[0], credentials);
          break;
        case 'facebook':
          result = await this.postToFacebook(formatData.content, mediaUrls, credentials);
          break;
        default:
          result = {
            platform,
            success: false,
            error: 'Platform not supported'
          };
      }
      
      results.push(result);
    }
    
    return results;
  }

  // Engagement boost automation
  async boostEngagement(postResults: PostResult[]): Promise<void> {
    // Auto-engagement logic (likes, shares, comments)
    for (const result of postResults) {
      if (result.success) {
        // Schedule engagement activities
        console.log(`Scheduling engagement boost for ${result.platform} post ${result.postId}`);
      }
    }
  }

  // Add animated subtitles to video content
  async addAnimatedCaptions(videoPath: string, captionText: string, style: string = 'modern'): Promise<string> {
    return new Promise((resolve) => {
      const pythonScript = `
import cv2
import numpy as np
from moviepy.editor import VideoFileClip, TextClip, CompositeVideoClip
import json
import sys
import os

def add_animated_captions(video_path, caption_text, style='modern'):
    try:
        # Load video
        video = VideoFileClip(video_path)
        
        # Split caption into words for word-by-word animation
        words = caption_text.split()
        duration_per_word = video.duration / len(words) if len(words) > 0 else 1
        
        # Style configurations
        styles = {
            'modern': {
                'fontsize': 60,
                'color': 'white',
                'font': 'Arial-Bold',
                'stroke_color': 'black',
                'stroke_width': 3
            },
            'minimal': {
                'fontsize': 45,
                'color': 'white', 
                'font': 'Arial',
                'stroke_color': None,
                'stroke_width': 0
            },
            'bold': {
                'fontsize': 70,
                'color': 'yellow',
                'font': 'Arial-Bold',
                'stroke_color': 'black',
                'stroke_width': 4
            },
            'creative': {
                'fontsize': 55,
                'color': 'white',
                'font': 'Comic Sans MS',
                'stroke_color': 'purple',
                'stroke_width': 2
            }
        }
        
        style_config = styles.get(style, styles['modern'])
        
        # Create animated text clips
        text_clips = []
        for i, word in enumerate(words):
            start_time = i * duration_per_word
            end_time = min((i + 3) * duration_per_word, video.duration)  # Show 3 words at a time
            
            # Create text clip with animation
            text_clip = TextClip(
                word,
                fontsize=style_config['fontsize'],
                color=style_config['color'],
                font=style_config['font'],
                stroke_color=style_config['stroke_color'],
                stroke_width=style_config['stroke_width']
            ).set_position(('center', 'bottom')).set_start(start_time).set_end(end_time)
            
            # Add fade in/out animation
            text_clip = text_clip.crossfadein(0.3).crossfadeout(0.3)
            
            text_clips.append(text_clip)
        
        # Composite video with animated captions
        final_video = CompositeVideoClip([video] + text_clips)
        
        # Generate output path
        output_path = video_path.replace('.mp4', '_captioned.mp4')
        
        # Export with optimized settings
        final_video.write_videofile(
            output_path,
            codec='libx264',
            audio_codec='aac',
            temp_audiofile='temp-audio.m4a',
            remove_temp=True,
            fps=30
        )
        
        # Clean up
        video.close()
        final_video.close()
        
        print(json.dumps({
            "success": True,
            "output_path": output_path,
            "caption_text": caption_text,
            "style": style
        }))
        
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))

if __name__ == "__main__":
    add_animated_captions(
        "${videoPath.replace(/"/g, '\\"')}", 
        "${captionText.replace(/"/g, '\\"')}", 
        "${style}"
    )
`;

      const python = spawn('python3', ['-c', pythonScript]);
      let output = '';

      python.stdout.on('data', (data) => {
        output += data.toString();
      });

      python.on('close', (code) => {
        try {
          const result = JSON.parse(output.trim());
          if (result.success) {
            resolve(result.output_path);
          } else {
            console.error('Caption generation error:', result.error);
            resolve(videoPath); // Return original if captioning fails
          }
        } catch {
          console.error('Caption parsing error');
          resolve(videoPath);
        }
      });
    });
  }

  // Add AI-generated voiceover to video content
  async addAIVoiceover(videoPath: string, voiceText: string, voiceSettings: any = {}): Promise<string> {
    return new Promise((resolve) => {
      const pythonScript = `
import json
import sys
import os
from moviepy.editor import VideoFileClip, AudioFileClip, CompositeAudioClip
import pyttsx3
import tempfile
from gtts import gTTS
import requests

def add_ai_voiceover(video_path, voice_text, voice_settings):
    try:
        # Load video
        video = VideoFileClip(video_path)
        
        # Voice settings with defaults
        provider = voice_settings.get('provider', 'gtts')
        language = voice_settings.get('language', 'en')
        speed = voice_settings.get('speed', 1.0)
        emotion = voice_settings.get('emotion', 'neutral')
        voice_gender = voice_settings.get('gender', 'female')
        
        # Generate voiceover based on provider
        temp_audio_path = None
        
        if provider == 'gtts':
            # Google Text-to-Speech (free)
            tts = gTTS(text=voice_text, lang=language, slow=False)
            temp_audio_path = tempfile.mktemp(suffix='.mp3')
            tts.save(temp_audio_path)
            
        elif provider == 'pyttsx3':
            # Offline TTS
            engine = pyttsx3.init()
            
            # Set voice properties
            voices = engine.getProperty('voices')
            if voices:
                if voice_gender == 'male' and len(voices) > 1:
                    engine.setProperty('voice', voices[0].id)
                else:
                    engine.setProperty('voice', voices[-1].id)
            
            # Set speed
            rate = engine.getProperty('rate')
            engine.setProperty('rate', int(rate * speed))
            
            temp_audio_path = tempfile.mktemp(suffix='.wav')
            engine.save_to_file(voice_text, temp_audio_path)
            engine.runAndWait()
            
        elif provider == 'elevenlabs':
            # ElevenLabs API (premium)
            api_key = voice_settings.get('api_key', '')
            voice_id = voice_settings.get('voice_id', '21m00Tcm4TlvDq8ikWAM')
            
            if api_key:
                url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
                headers = {
                    "Accept": "audio/mpeg",
                    "Content-Type": "application/json",
                    "xi-api-key": api_key
                }
                data = {
                    "text": voice_text,
                    "model_id": "eleven_monolingual_v1",
                    "voice_settings": {
                        "stability": 0.5,
                        "similarity_boost": 0.5
                    }
                }
                
                response = requests.post(url, json=data, headers=headers)
                if response.status_code == 200:
                    temp_audio_path = tempfile.mktemp(suffix='.mp3')
                    with open(temp_audio_path, 'wb') as f:
                        f.write(response.content)
                else:
                    # Fallback to gTTS
                    tts = gTTS(text=voice_text, lang=language, slow=False)
                    temp_audio_path = tempfile.mktemp(suffix='.mp3')
                    tts.save(temp_audio_path)
        
        if not temp_audio_path or not os.path.exists(temp_audio_path):
            print(json.dumps({"success": False, "error": "Failed to generate audio"}))
            return
        
        # Load generated audio
        audio = AudioFileClip(temp_audio_path)
        
        # Adjust audio duration to match video
        if audio.duration > video.duration:
            audio = audio.subclip(0, video.duration)
        elif audio.duration < video.duration:
            # Loop audio if shorter than video
            loops_needed = int(video.duration / audio.duration) + 1
            audio = CompositeAudioClip([audio] * loops_needed).subclip(0, video.duration)
        
        # Mix with existing audio or replace
        if video.audio:
            # Lower original audio volume and mix with voiceover
            original_audio = video.audio.volumex(0.3)
            final_audio = CompositeAudioClip([original_audio, audio.volumex(0.8)])
        else:
            final_audio = audio
        
        # Create final video with voiceover
        final_video = video.set_audio(final_audio)
        
        # Generate output path
        output_path = video_path.replace('.mp4', '_voiced.mp4')
        
        # Export with optimized settings
        final_video.write_videofile(
            output_path,
            codec='libx264',
            audio_codec='aac',
            temp_audiofile='temp-audio.m4a',
            remove_temp=True,
            fps=30
        )
        
        # Clean up
        video.close()
        audio.close()
        final_video.close()
        if temp_audio_path and os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)
        
        print(json.dumps({
            "success": True,
            "output_path": output_path,
            "voice_text": voice_text,
            "provider": provider,
            "settings": voice_settings
        }))
        
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))

if __name__ == "__main__":
    add_ai_voiceover(
        "${videoPath.replace(/"/g, '\\"')}", 
        "${voiceText.replace(/"/g, '\\"')}", 
        ${JSON.stringify(voiceSettings)}
    )
`;

      const python = spawn('python3', ['-c', pythonScript]);
      let output = '';

      python.stdout.on('data', (data) => {
        output += data.toString();
      });

      python.on('close', (code) => {
        try {
          const result = JSON.parse(output.trim());
          if (result.success) {
            resolve(result.output_path);
          } else {
            console.error('Voiceover generation error:', result.error);
            resolve(videoPath); // Return original if voiceover fails
          }
        } catch {
          console.error('Voiceover parsing error');
          resolve(videoPath);
        }
      });
    });
  }

  // Generate smart voiceover script from content
  async generateSmartVoiceoverScript(content: string, platform: string, duration?: number): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `Generate an engaging voiceover script for ${platform} content. Focus on:
            - Hook the audience in the first 3 seconds
            - Clear, conversational tone that matches the platform
            - Natural speech patterns with appropriate pauses
            - Strong call-to-action at the end
            - Optimal pacing for ${duration ? duration + ' seconds' : 'short-form'} content
            
            Keep the script concise, engaging, and optimized for voice delivery.`
          },
          {
            role: "user",
            content: `Generate a voiceover script for this content: "${content}"${duration ? ` (Target duration: ${duration} seconds)` : ''}`
          }
        ]
      });

      return response.choices[0].message.content || content.substring(0, 200);
    } catch (error) {
      console.error('Smart voiceover script generation error:', error);
      return content.substring(0, 200);
    }
  }

  // Generate smart captions from video content
  async generateSmartCaptions(content: string, platform: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `Generate engaging, short captions for ${platform} that would work well as animated subtitles. Focus on:
            - Key phrases that grab attention
            - Platform-appropriate language and tone
            - Emotional hooks and call-to-actions
            - Optimal length for subtitle display (3-8 words per segment)
            
            Return a single caption text that can be split into animated segments.`
          },
          {
            role: "user",
            content: `Generate animated caption text for this content: "${content}"`
          }
        ]
      });

      return response.choices[0].message.content || content.substring(0, 100);
    } catch (error) {
      console.error('Smart caption generation error:', error);
      return content.substring(0, 100);
    }
  }

  // Enhanced posting with caption and voiceover support
  async executeAutoPostingWithEnhancements(
    content: string,
    mediaUrls: string[],
    platforms: string[],
    platformCredentials: Record<string, any>,
    options?: {
      captions?: { enabled: boolean; style: string; customText?: string };
      voiceover?: { enabled: boolean; provider: string; settings: any; customScript?: string };
    }
  ): Promise<PostResult[]> {
    const results: PostResult[] = [];
    
    // Format content for each platform
    const platformFormats = await this.formatContentForPlatforms(content, mediaUrls, platforms);
    
    // Process video content with voiceover and captions if enabled
    let processedMediaUrls = mediaUrls;
    
    // Add voiceover first if enabled
    if (options?.voiceover?.enabled && mediaUrls.some(url => url.includes('.mp4'))) {
      processedMediaUrls = await Promise.all(
        mediaUrls.map(async (url) => {
          if (url.includes('.mp4')) {
            const voiceScript = options.voiceover?.customScript || await this.generateSmartVoiceoverScript(content, platforms[0]);
            return await this.addAIVoiceover(url, voiceScript, options.voiceover?.settings);
          }
          return url;
        })
      );
    }
    
    // Add captions after voiceover if enabled
    if (options?.captions?.enabled && processedMediaUrls.some(url => url.includes('.mp4'))) {
      processedMediaUrls = await Promise.all(
        processedMediaUrls.map(async (url) => {
          if (url.includes('.mp4')) {
            const captionText = options.captions?.customText || await this.generateSmartCaptions(content, platforms[0]);
            return await this.addAnimatedCaptions(url, captionText, options.captions?.style);
          }
          return url;
        })
      );
    }
    
    // Post to each platform with processed media
    for (const platform of platforms) {
      const formatData = platformFormats[platform];
      if (!formatData) continue;
      
      const credentials = platformCredentials[platform];
      if (!credentials) {
        results.push({
          platform,
          success: false,
          error: 'No credentials configured for platform'
        });
        continue;
      }
      
      let result: PostResult;
      
      switch (platform) {
        case 'instagram':
          result = await this.postToInstagram(formatData.content, processedMediaUrls, credentials);
          break;
        case 'telegram':
          result = await this.postToTelegram(formatData.content, processedMediaUrls, credentials);
          break;
        case 'youtube':
          result = await this.postToYouTubeShorts(formatData.content, processedMediaUrls[0], credentials);
          break;
        case 'facebook':
          result = await this.postToFacebook(formatData.content, processedMediaUrls, credentials);
          break;
        default:
          result = {
            platform,
            success: false,
            error: 'Platform not supported'
          };
      }
      
      results.push(result);
    }
    
    return results;
  }

  // Analytics tracking
  async trackPostPerformance(postResults: PostResult[]): Promise<Record<string, any>> {
    const analytics: Record<string, any> = {};
    
    for (const result of postResults) {
      if (result.success) {
        analytics[result.platform] = {
          postId: result.postId,
          url: result.url,
          posted: true,
          timestamp: new Date().toISOString()
        };
      } else {
        analytics[result.platform] = {
          posted: false,
          error: result.error,
          timestamp: new Date().toISOString()
        };
      }
    }
    
    return analytics;
  }
}

export const crossPlatformPosterService = new CrossPlatformPosterService();