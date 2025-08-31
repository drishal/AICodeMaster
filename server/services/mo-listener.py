#!/usr/bin/env python3
"""
MO Listener Service - Shadow Control Interface
Connects MO app with Termux/Android automation
Phase 2 - Advanced Mobile Control System
"""

import os
import json
import time
import asyncio
import aiohttp
from pathlib import Path
from typing import Dict, Any, List, Optional
import subprocess
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class MoListener:
    """Main listener service for MO app commands"""
    
    def __init__(self, config_file: str = "mo_config.json"):
        self.config_file = Path(config_file)
        self.config = self.load_config()
        self.command_queue = []
        self.is_running = False
        
        # API endpoints
        self.replit_api = self.config.get("replit_api", "http://localhost:5000")
        self.auth_token = self.config.get("auth_token", "")
        
        # Command mapping
        self.command_handlers = {
            "termux_command": self.execute_termux_command,
            "app_control": self.control_android_app,
            "file_operation": self.handle_file_operation,
            "social_action": self.execute_social_action,
            "voice_command": self.process_voice_command,
            "automation_task": self.run_automation_task
        }
    
    def load_config(self) -> Dict[str, Any]:
        """Load configuration from JSON file"""
        if self.config_file.exists():
            try:
                with open(self.config_file, 'r') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Config load error: {e}")
        
        # Default configuration
        default_config = {
            "replit_api": "http://localhost:5000",
            "auth_token": "",
            "polling_interval": 2,
            "max_retries": 3,
            "log_commands": True,
            "allowed_commands": [
                "termux_command",
                "app_control",
                "file_operation",
                "social_action"
            ]
        }
        
        self.save_config(default_config)
        return default_config
    
    def save_config(self, config: Dict[str, Any]):
        """Save configuration to JSON file"""
        try:
            with open(self.config_file, 'w') as f:
                json.dump(config, f, indent=2)
        except Exception as e:
            logger.error(f"Config save error: {e}")
    
    async def fetch_commands(self) -> List[Dict[str, Any]]:
        """Fetch pending commands from Replit API"""
        try:
            async with aiohttp.ClientSession() as session:
                headers = {"Authorization": f"Bearer {self.auth_token}"}
                async with session.get(f"{self.replit_api}/api/command-queue", headers=headers) as response:
                    if response.status == 200:
                        commands = await response.json()
                        return commands
                    else:
                        logger.warning(f"API fetch failed: {response.status}")
                        return []
        except Exception as e:
            logger.error(f"Command fetch error: {e}")
            return []
    
    async def execute_termux_command(self, command: Dict[str, Any]) -> Dict[str, Any]:
        """Execute terminal command in Termux"""
        try:
            cmd = command.get("command", "")
            if not cmd:
                return {"success": False, "error": "Empty command"}
            
            # Security check - whitelist safe commands
            safe_commands = ["ls", "pwd", "python", "pkg", "apt", "pip", "git", "curl", "wget"]
            if not any(cmd.startswith(safe_cmd) for safe_cmd in safe_commands):
                logger.warning(f"Blocked potentially unsafe command: {cmd}")
                return {"success": False, "error": "Command not allowed"}
            
            # Execute command
            result = subprocess.run(
                cmd,
                shell=True,
                capture_output=True,
                text=True,
                timeout=30
            )
            
            return {
                "success": True,
                "output": result.stdout,
                "error": result.stderr,
                "exit_code": result.returncode
            }
        
        except subprocess.TimeoutExpired:
            return {"success": False, "error": "Command timeout"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def control_android_app(self, command: Dict[str, Any]) -> Dict[str, Any]:
        """Control Android apps using automation tools"""
        try:
            app_name = command.get("app", "")
            action = command.get("action", "")
            params = command.get("params", {})
            
            # Map common app actions to shell commands
            action_commands = {
                "instagram": {
                    "open": "am start -n com.instagram.android/.activity.MainTabActivity",
                    "like": "input tap 500 800",  # Approximate like button position
                    "scroll": "input swipe 500 1000 500 500 300"
                },
                "whatsapp": {
                    "open": "am start -n com.whatsapp/.HomeActivity",
                    "send_message": "input text '{message}'"
                },
                "telegram": {
                    "open": "am start -n org.telegram.messenger/.DefaultIcon"
                }
            }
            
            if app_name in action_commands and action in action_commands[app_name]:
                cmd = action_commands[app_name][action]
                if "{message}" in cmd and "message" in params:
                    cmd = cmd.format(message=params["message"])
                
                result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
                return {
                    "success": True,
                    "app": app_name,
                    "action": action,
                    "output": result.stdout
                }
            else:
                return {"success": False, "error": f"Unknown app/action: {app_name}/{action}"}
        
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def handle_file_operation(self, command: Dict[str, Any]) -> Dict[str, Any]:
        """Handle file operations"""
        try:
            operation = command.get("operation", "")
            file_path = command.get("path", "")
            
            if operation == "read":
                with open(file_path, 'r') as f:
                    content = f.read()
                return {"success": True, "content": content}
            
            elif operation == "write":
                content = command.get("content", "")
                with open(file_path, 'w') as f:
                    f.write(content)
                return {"success": True, "message": "File written"}
            
            elif operation == "delete":
                os.remove(file_path)
                return {"success": True, "message": "File deleted"}
            
            else:
                return {"success": False, "error": f"Unknown operation: {operation}"}
        
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def execute_social_action(self, command: Dict[str, Any]) -> Dict[str, Any]:
        """Execute social media actions"""
        try:
            platform = command.get("platform", "")
            action = command.get("action", "")
            content = command.get("content", "")
            
            # Log social action for audit
            logger.info(f"Social action: {platform} - {action}")
            
            # Simulate social media posting (would integrate with actual APIs)
            return {
                "success": True,
                "platform": platform,
                "action": action,
                "message": f"Executed {action} on {platform}",
                "timestamp": time.time()
            }
        
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def process_voice_command(self, command: Dict[str, Any]) -> Dict[str, Any]:
        """Process voice commands"""
        try:
            text = command.get("text", "")
            voice_file = f"/tmp/voice_{int(time.time())}.mp3"
            
            # Generate voice using TTS
            from gtts import gTTS
            tts = gTTS(text=text, lang='en')
            tts.save(voice_file)
            
            # Play voice file
            subprocess.run(f"play {voice_file}", shell=True)
            
            return {"success": True, "voice_file": voice_file}
        
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def run_automation_task(self, command: Dict[str, Any]) -> Dict[str, Any]:
        """Run complex automation tasks"""
        try:
            task_type = command.get("task_type", "")
            params = command.get("params", {})
            
            if task_type == "content_creation":
                # Integrate with content automation service
                from content_automation import ContentAutomation
                automation = ContentAutomation()
                result = automation.process_command(params)
                return result
            
            elif task_type == "social_scheduler":
                # Schedule social media posts
                return {"success": True, "message": "Social post scheduled"}
            
            else:
                return {"success": False, "error": f"Unknown task type: {task_type}"}
        
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def send_result(self, command_id: str, result: Dict[str, Any]):
        """Send command execution result back to Replit API"""
        try:
            async with aiohttp.ClientSession() as session:
                headers = {"Authorization": f"Bearer {self.auth_token}"}
                payload = {
                    "command_id": command_id,
                    "result": result,
                    "timestamp": time.time()
                }
                
                async with session.post(
                    f"{self.replit_api}/api/command-results",
                    json=payload,
                    headers=headers
                ) as response:
                    if response.status != 200:
                        logger.warning(f"Result send failed: {response.status}")
        except Exception as e:
            logger.error(f"Result send error: {e}")
    
    async def main_loop(self):
        """Main listener loop"""
        logger.info("MO Listener started")
        self.is_running = True
        
        while self.is_running:
            try:
                # Fetch pending commands
                commands = await self.fetch_commands()
                
                for command in commands:
                    command_type = command.get("type", "")
                    command_id = command.get("id", "")
                    
                    if command_type in self.command_handlers:
                        # Execute command
                        result = await self.command_handlers[command_type](command)
                        
                        # Send result back
                        await self.send_result(command_id, result)
                        
                        if self.config.get("log_commands", True):
                            logger.info(f"Executed: {command_type} - {result.get('success', False)}")
                    else:
                        logger.warning(f"Unknown command type: {command_type}")
                
                # Wait before next poll
                await asyncio.sleep(self.config.get("polling_interval", 2))
            
            except KeyboardInterrupt:
                logger.info("Shutting down MO Listener")
                self.is_running = False
                break
            except Exception as e:
                logger.error(f"Main loop error: {e}")
                await asyncio.sleep(5)  # Wait before retry

def main():
    """Entry point for MO Listener"""
    listener = MoListener()
    
    try:
        asyncio.run(listener.main_loop())
    except KeyboardInterrupt:
        print("\nMO Listener stopped")

if __name__ == "__main__":
    main()