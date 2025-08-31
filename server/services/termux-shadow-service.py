#!/usr/bin/env python3
"""
Termux Shadow Controller Service
Invisible mobile app automation for Android through Termux + ADB
Handles encrypted command execution with human-like behavior patterns
"""

import os
import json
import time
import random
import asyncio
import subprocess
import threading
from typing import Dict, List, Optional, Tuple
import base64
from cryptography.fernet import Fernet
import logging

# Import required automation libraries
try:
    import uiautomator2 as u2
    import numpy as np
    import cv2
    from PIL import Image
    import pyautogui
except ImportError as e:
    logging.error(f"Required automation library not installed: {e}")
    raise

class ShadowCommand:
    """Represents a shadow automation command"""
    
    def __init__(self, app: str, action: str, target: str = None, 
                 coordinates: Tuple[int, int] = None, text: str = None,
                 duration: int = 1000, delay: int = 500):
        self.app = app
        self.action = action
        self.target = target
        self.coordinates = coordinates
        self.text = text
        self.duration = duration
        self.delay = delay
        self.id = self.generate_id()
        self.status = "pending"
        self.created_at = time.time()
        self.executed_at = None
        self.result = None
    
    def generate_id(self) -> str:
        """Generate unique command ID"""
        return base64.urlsafe_b64encode(
            f"{self.app}_{self.action}_{int(time.time())}".encode()
        ).decode()[:12]

class TermuxShadowService:
    """Main service for invisible mobile automation"""
    
    def __init__(self):
        self.device_id = None
        self.device = None
        self.shadow_mode = False
        self.encryption_key = self.generate_encryption_key()
        self.command_queue = asyncio.Queue()
        self.running_commands = {}
        self.app_packages = {
            'Instagram': 'com.instagram.android',
            'WhatsApp': 'com.whatsapp',
            'YouTube': 'com.google.android.youtube',
            'Telegram': 'org.telegram.messenger',
            'TikTok': 'com.zhiliaoapp.musically',
            'Facebook': 'com.facebook.katana',
            'Twitter': 'com.twitter.android',
            'LinkedIn': 'com.linkedin.android'
        }
        
        self.setup_logging()
        self.setup_human_patterns()
    
    def setup_logging(self):
        """Setup logging configuration"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('./logs/shadow_service.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def setup_human_patterns(self):
        """Setup human-like behavior patterns"""
        self.human_delays = {
            'tap': (50, 200),
            'swipe': (200, 800),
            'type': (80, 300),
            'scroll': (100, 500),
            'navigate': (500, 2000)
        }
        
        self.human_coordinates_variance = 15  # pixels
        self.typing_speed_variance = (0.05, 0.3)  # seconds per character
    
    def generate_encryption_key(self) -> bytes:
        """Generate encryption key for secure communication"""
        key_file = './config/shadow_key.key'
        
        if os.path.exists(key_file):
            with open(key_file, 'rb') as f:
                return f.read()
        else:
            key = Fernet.generate_key()
            os.makedirs('./config', exist_ok=True)
            with open(key_file, 'wb') as f:
                f.write(key)
            return key
    
    def encrypt_command(self, command_data: dict) -> str:
        """Encrypt command data for secure transmission"""
        fernet = Fernet(self.encryption_key)
        json_data = json.dumps(command_data).encode()
        encrypted_data = fernet.encrypt(json_data)
        return base64.urlsafe_b64encode(encrypted_data).decode()
    
    def decrypt_command(self, encrypted_command: str) -> dict:
        """Decrypt received command"""
        fernet = Fernet(self.encryption_key)
        encrypted_data = base64.urlsafe_b64decode(encrypted_command.encode())
        json_data = fernet.decrypt(encrypted_data)
        return json.loads(json_data.decode())
    
    async def initialize_device(self) -> bool:
        """Initialize connection to Android device via ADB"""
        try:
            self.logger.info("Initializing device connection...")
            
            # Check if ADB is available
            result = subprocess.run(['adb', 'devices'], 
                                 capture_output=True, text=True)
            
            if result.returncode != 0:
                self.logger.error("ADB not found. Please install Android SDK Platform Tools.")
                return False
            
            # Get connected devices
            devices = []
            for line in result.stdout.split('\n')[1:]:
                if 'device' in line and 'offline' not in line:
                    device_id = line.split('\t')[0]
                    devices.append(device_id)
            
            if not devices:
                self.logger.error("No Android devices connected. Please connect via USB or WiFi.")
                return False
            
            # Use first available device
            self.device_id = devices[0]
            self.device = u2.connect(self.device_id)
            
            # Test connection
            device_info = self.device.info
            self.logger.info(f"Connected to device: {device_info.get('brand', 'Unknown')} "
                           f"{device_info.get('model', 'Unknown')}")
            
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to initialize device: {e}")
            return False
    
    def add_human_variance(self, x: int, y: int) -> Tuple[int, int]:
        """Add human-like variance to coordinates"""
        if not self.shadow_mode:
            return x, y
        
        variance = self.human_coordinates_variance
        new_x = x + random.randint(-variance, variance)
        new_y = y + random.randint(-variance, variance)
        
        return max(0, new_x), max(0, new_y)
    
    def get_human_delay(self, action: str) -> float:
        """Get human-like delay for action"""
        if not self.shadow_mode:
            return 0.1
        
        min_delay, max_delay = self.human_delays.get(action, (100, 500))
        base_delay = random.uniform(min_delay, max_delay) / 1000
        
        # Add random micro-pauses
        if random.random() < 0.3:  # 30% chance of extra pause
            base_delay += random.uniform(0.2, 1.0)
        
        return base_delay
    
    async def launch_app(self, app_name: str) -> bool:
        """Launch specified app"""
        try:
            package = self.app_packages.get(app_name)
            if not package:
                self.logger.error(f"Unknown app: {app_name}")
                return False
            
            self.logger.info(f"Launching {app_name} ({package})")
            
            # Launch app
            self.device.app_start(package)
            
            # Wait for app to load
            await asyncio.sleep(self.get_human_delay('navigate'))
            
            # Verify app is running
            current_app = self.device.app_current()
            if current_app['package'] == package:
                self.logger.info(f"{app_name} launched successfully")
                return True
            else:
                self.logger.error(f"Failed to launch {app_name}")
                return False
                
        except Exception as e:
            self.logger.error(f"Error launching {app_name}: {e}")
            return False
    
    async def perform_tap(self, x: int, y: int, element_desc: str = None) -> bool:
        """Perform tap with human-like behavior"""
        try:
            # Add human variance to coordinates
            tap_x, tap_y = self.add_human_variance(x, y)
            
            self.logger.info(f"Tapping at ({tap_x}, {tap_y})" + 
                           (f" - {element_desc}" if element_desc else ""))
            
            # Human-like pre-tap delay
            await asyncio.sleep(self.get_human_delay('tap'))
            
            # Perform tap
            self.device.click(tap_x, tap_y)
            
            # Post-tap delay
            await asyncio.sleep(self.get_human_delay('tap'))
            
            return True
            
        except Exception as e:
            self.logger.error(f"Error performing tap: {e}")
            return False
    
    async def perform_swipe(self, start_x: int, start_y: int, 
                          end_x: int, end_y: int, duration: float = 0.5) -> bool:
        """Perform swipe with human-like behavior"""
        try:
            # Add variance to coordinates
            start_x, start_y = self.add_human_variance(start_x, start_y)
            end_x, end_y = self.add_human_variance(end_x, end_y)
            
            self.logger.info(f"Swiping from ({start_x}, {start_y}) to ({end_x}, {end_y})")
            
            # Human-like pre-swipe delay
            await asyncio.sleep(self.get_human_delay('swipe'))
            
            # Perform swipe
            self.device.swipe(start_x, start_y, end_x, end_y, duration)
            
            # Post-swipe delay
            await asyncio.sleep(self.get_human_delay('swipe'))
            
            return True
            
        except Exception as e:
            self.logger.error(f"Error performing swipe: {e}")
            return False
    
    async def perform_type(self, text: str, element_selector: str = None) -> bool:
        """Type text with human-like speed variation"""
        try:
            self.logger.info(f"Typing text: '{text[:50]}...' " + 
                           (f"in {element_selector}" if element_selector else ""))
            
            if element_selector:
                # Find and tap input field first
                element = self.device(text=element_selector)
                if element.exists:
                    element.click()
                    await asyncio.sleep(0.5)
            
            # Clear existing text
            self.device.clear_text()
            await asyncio.sleep(0.3)
            
            if self.shadow_mode:
                # Type character by character with human-like delays
                for char in text:
                    self.device.send_keys(char)
                    delay = random.uniform(*self.typing_speed_variance)
                    await asyncio.sleep(delay)
            else:
                # Fast typing for non-shadow mode
                self.device.send_keys(text)
            
            return True
            
        except Exception as e:
            self.logger.error(f"Error typing text: {e}")
            return False
    
    async def perform_instagram_action(self, action: str, target: str = None) -> bool:
        """Perform Instagram-specific actions"""
        try:
            if not await self.launch_app('Instagram'):
                return False
            
            if action == 'like':
                # Find and like posts
                like_buttons = self.device(resourceId="com.instagram.android:id/row_feed_button_like")
                if like_buttons.exists:
                    for i in range(min(3, like_buttons.count)):  # Like up to 3 posts
                        button = like_buttons[i]
                        if button.exists and not button.info.get('selected', False):
                            await self.perform_tap(button.center()[0], button.center()[1], "like button")
                            await asyncio.sleep(random.uniform(2, 5))  # Human delay between likes
                    return True
                
            elif action == 'comment':
                # Find comment button and add comment
                comment_buttons = self.device(resourceId="com.instagram.android:id/row_feed_button_comment")
                if comment_buttons.exists:
                    await self.perform_tap(comment_buttons[0].center()[0], 
                                         comment_buttons[0].center()[1], "comment button")
                    await asyncio.sleep(1)
                    
                    # Type comment
                    if target:  # target contains the comment text
                        await self.perform_type(target, "Add a comment...")
                        
                        # Find and tap post button
                        post_button = self.device(text="Post")
                        if post_button.exists:
                            await self.perform_tap(post_button.center()[0], 
                                                 post_button.center()[1], "post comment")
                    return True
                    
            elif action == 'follow':
                # Find and tap follow buttons
                follow_buttons = self.device(text="Follow")
                if follow_buttons.exists:
                    await self.perform_tap(follow_buttons[0].center()[0], 
                                         follow_buttons[0].center()[1], "follow button")
                    return True
                    
            elif action == 'scroll':
                # Scroll through feed
                screen_height = self.device.info['displayHeight']
                screen_width = self.device.info['displayWidth']
                
                start_y = int(screen_height * 0.8)
                end_y = int(screen_height * 0.3)
                x = screen_width // 2
                
                await self.perform_swipe(x, start_y, x, end_y, duration=0.8)
                return True
            
            return False
            
        except Exception as e:
            self.logger.error(f"Error performing Instagram action '{action}': {e}")
            return False
    
    async def perform_whatsapp_action(self, action: str, target: str = None, text: str = None) -> bool:
        """Perform WhatsApp-specific actions"""
        try:
            if not await self.launch_app('WhatsApp'):
                return False
            
            if action == 'send_message':
                if not target or not text:
                    return False
                
                # Search for contact
                search_button = self.device(resourceId="com.whatsapp:id/search")
                if search_button.exists:
                    await self.perform_tap(search_button.center()[0], 
                                         search_button.center()[1], "search")
                    await asyncio.sleep(1)
                    
                    # Type contact name
                    await self.perform_type(target)
                    await asyncio.sleep(1)
                    
                    # Tap first result
                    first_result = self.device(resourceId="com.whatsapp:id/contactpicker_row_name")
                    if first_result.exists:
                        await self.perform_tap(first_result[0].center()[0], 
                                             first_result[0].center()[1], "contact")
                        await asyncio.sleep(1)
                        
                        # Type message
                        message_input = self.device(resourceId="com.whatsapp:id/entry")
                        if message_input.exists:
                            await self.perform_tap(message_input.center()[0], 
                                                 message_input.center()[1], "message input")
                            await self.perform_type(text)
                            
                            # Send message
                            send_button = self.device(resourceId="com.whatsapp:id/send")
                            if send_button.exists:
                                await self.perform_tap(send_button.center()[0], 
                                                     send_button.center()[1], "send")
                                return True
            
            return False
            
        except Exception as e:
            self.logger.error(f"Error performing WhatsApp action '{action}': {e}")
            return False
    
    async def execute_command(self, command: ShadowCommand) -> dict:
        """Execute a shadow command"""
        try:
            command.status = "running"
            command.executed_at = time.time()
            
            self.logger.info(f"Executing command {command.id}: {command.action} in {command.app}")
            
            success = False
            
            # Route command to appropriate handler
            if command.app == 'Instagram':
                success = await self.perform_instagram_action(command.action, 
                                                            command.target, 
                                                            command.text)
            elif command.app == 'WhatsApp':
                success = await self.perform_whatsapp_action(command.action, 
                                                           command.target, 
                                                           command.text)
            elif command.action == 'tap' and command.coordinates:
                success = await self.perform_tap(command.coordinates[0], 
                                               command.coordinates[1], 
                                               command.target)
            elif command.action == 'type' and command.text:
                success = await self.perform_type(command.text, command.target)
            
            # Update command status
            command.status = "completed" if success else "failed"
            command.result = "Success" if success else "Failed to execute command"
            
            # Add final delay
            await asyncio.sleep(self.get_human_delay('navigate'))
            
            return {
                "id": command.id,
                "status": command.status,
                "result": command.result,
                "executed_at": command.executed_at
            }
            
        except Exception as e:
            command.status = "failed"
            command.result = f"Error: {str(e)}"
            self.logger.error(f"Command execution failed: {e}")
            
            return {
                "id": command.id,
                "status": "failed",
                "result": str(e),
                "executed_at": command.executed_at
            }
    
    async def process_command_queue(self):
        """Process commands from the queue"""
        while True:
            try:
                command = await self.command_queue.get()
                self.running_commands[command.id] = command
                
                result = await self.execute_command(command)
                
                # Remove from running commands
                if command.id in self.running_commands:
                    del self.running_commands[command.id]
                
                self.logger.info(f"Command {command.id} completed with result: {result['status']}")
                
            except Exception as e:
                self.logger.error(f"Error processing command queue: {e}")
                await asyncio.sleep(1)
    
    def toggle_shadow_mode(self, enabled: bool):
        """Toggle shadow mode on/off"""
        self.shadow_mode = enabled
        self.logger.info(f"Shadow mode {'enabled' if enabled else 'disabled'}")
    
    async def add_command(self, command_data: dict) -> str:
        """Add command to execution queue"""
        try:
            command = ShadowCommand(
                app=command_data['app'],
                action=command_data['action'],
                target=command_data.get('target'),
                coordinates=command_data.get('coordinates'),
                text=command_data.get('text'),
                duration=command_data.get('duration', 1000),
                delay=command_data.get('delay', 500)
            )
            
            await self.command_queue.put(command)
            self.logger.info(f"Command {command.id} added to queue")
            
            return command.id
            
        except Exception as e:
            self.logger.error(f"Error adding command: {e}")
            raise
    
    def get_device_info(self) -> dict:
        """Get connected device information"""
        if not self.device:
            return {}
        
        try:
            info = self.device.info
            return {
                "device_id": self.device_id,
                "brand": info.get('brand', 'Unknown'),
                "model": info.get('model', 'Unknown'),
                "version": info.get('version', 'Unknown'),
                "resolution": f"{info.get('displayWidth', 0)}x{info.get('displayHeight', 0)}",
                "connected": True,
                "shadow_mode": self.shadow_mode
            }
        except Exception:
            return {"connected": False}

# Initialize the shadow service
shadow_service = TermuxShadowService()

async def main():
    """Main service entry point"""
    print("Starting Termux Shadow Controller Service...")
    
    # Initialize device connection
    if await shadow_service.initialize_device():
        print("Device connected successfully!")
        
        # Start command processing
        await shadow_service.process_command_queue()
    else:
        print("Failed to connect to device. Please ensure:")
        print("1. Android device is connected via USB or WiFi")
        print("2. USB debugging is enabled")
        print("3. ADB is installed and accessible")

if __name__ == "__main__":
    asyncio.run(main())