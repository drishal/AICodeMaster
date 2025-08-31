import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

export interface MobileControlOptions {
  app: string;
  action: 'like' | 'comment' | 'reply' | 'follow' | 'share' | 'scroll' | 'tap' | 'swipe';
  target?: string;
  text?: string;
  coordinates?: { x: number; y: number };
  delay?: number;
  humanBehavior?: boolean;
}

export interface MobileControlResult {
  success: boolean;
  action: string;
  app: string;
  result?: any;
  error?: string;
  executionTime?: number;
  screenshotPath?: string;
}

export interface AppConfig {
  packageName: string;
  activityName: string;
  selectors: {
    likeButton?: string;
    commentButton?: string;
    followButton?: string;
    shareButton?: string;
    textInput?: string;
  };
}

export class MobileControlService {
  private static instance: MobileControlService;
  private readonly configDir = './server/configs';
  private readonly screenshotsDir = './uploads/screenshots';
  private readonly logFile = './uploads/mobile-control.log';

  // Predefined app configurations
  private appConfigs: { [key: string]: AppConfig } = {
    instagram: {
      packageName: 'com.instagram.android',
      activityName: 'com.instagram.android.activity.MainTabActivity',
      selectors: {
        likeButton: 'com.instagram.android:id/row_feed_button_like',
        commentButton: 'com.instagram.android:id/row_feed_button_comment',
        followButton: 'com.instagram.android:id/follow_button',
        shareButton: 'com.instagram.android:id/row_feed_button_share',
        textInput: 'com.instagram.android:id/layout_comment_thread_edittext'
      }
    },
    tiktok: {
      packageName: 'com.zhiliaoapp.musically',
      activityName: 'com.ss.android.ugc.aweme.splash.SplashActivity',
      selectors: {
        likeButton: 'com.zhiliaoapp.musically:id/aqm',
        commentButton: 'com.zhiliaoapp.musically:id/aql',
        followButton: 'com.zhiliaoapp.musically:id/follow_btn',
        shareButton: 'com.zhiliaoapp.musically:id/aqo'
      }
    },
    youtube: {
      packageName: 'com.google.android.youtube',
      activityName: 'com.google.android.youtube.HomeActivity',
      selectors: {
        likeButton: 'com.google.android.youtube:id/like_button',
        commentButton: 'com.google.android.youtube:id/comments_entry_point_simplebox',
        followButton: 'com.google.android.youtube:id/subscribe_button',
        shareButton: 'com.google.android.youtube:id/share'
      }
    },
    facebook: {
      packageName: 'com.facebook.katana',
      activityName: 'com.facebook.katana.LoginActivity',
      selectors: {
        likeButton: 'com.facebook.katana:id/like_button',
        commentButton: 'com.facebook.katana:id/comment_button',
        followButton: 'com.facebook.katana:id/follow_button',
        shareButton: 'com.facebook.katana:id/share_button'
      }
    },
    twitter: {
      packageName: 'com.twitter.android',
      activityName: 'com.twitter.app.main.MainActivity',
      selectors: {
        likeButton: 'com.twitter.android:id/like',
        commentButton: 'com.twitter.android:id/reply',
        followButton: 'com.twitter.android:id/follow_button',
        shareButton: 'com.twitter.android:id/retweet'
      }
    },
    telegram: {
      packageName: 'org.telegram.messenger',
      activityName: 'org.telegram.ui.LaunchActivity',
      selectors: {
        textInput: 'org.telegram.messenger:id/chat_text_edit'
      }
    }
  };

  static getInstance(): MobileControlService {
    if (!MobileControlService.instance) {
      MobileControlService.instance = new MobileControlService();
    }
    return MobileControlService.instance;
  }

  constructor() {
    this.ensureDirectories();
  }

  private async ensureDirectories() {
    try {
      await fs.mkdir(this.configDir, { recursive: true });
      await fs.mkdir(this.screenshotsDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create directories:', error);
    }
  }

  async controlApp(options: MobileControlOptions): Promise<MobileControlResult> {
    const startTime = Date.now();
    
    try {
      const { app, action, target, text, coordinates, delay = 1000, humanBehavior = true } = options;
      
      // Get app configuration
      const appConfig = this.appConfigs[app.toLowerCase()];
      if (!appConfig) {
        return {
          success: false,
          action,
          app,
          error: `App '${app}' is not supported. Available apps: ${Object.keys(this.appConfigs).join(', ')}`
        };
      }

      // Take screenshot before action
      const beforeScreenshot = await this.takeScreenshot('before');

      // Execute the action
      const result = await this.executeAction(appConfig, action, { target, text, coordinates, delay, humanBehavior });

      // Take screenshot after action
      const afterScreenshot = await this.takeScreenshot('after');

      // Log the action
      await this.logAction({
        app,
        action,
        target,
        text: text ? '[REDACTED]' : undefined,
        result: result.success,
        timestamp: new Date().toISOString(),
        executionTime: Date.now() - startTime
      });

      return {
        success: result.success,
        action,
        app,
        result: result.data,
        error: result.error,
        executionTime: Date.now() - startTime,
        screenshotPath: afterScreenshot
      };

    } catch (error) {
      return {
        success: false,
        action: options.action,
        app: options.app,
        error: `Mobile control failed: ${error instanceof Error ? error.message : String(error)}`,
        executionTime: Date.now() - startTime
      };
    }
  }

  private async executeAction(appConfig: AppConfig, action: string, params: any): Promise<{ success: boolean; data?: any; error?: string }> {
    const { target, text, coordinates, delay, humanBehavior } = params;

    try {
      // First, ensure the app is running
      await this.launchApp(appConfig.packageName);
      
      // Add delay for app to fully load
      if (humanBehavior) {
        await this.humanDelay(delay);
      } else {
        await this.sleep(delay);
      }

      switch (action) {
        case 'like':
          return await this.performLike(appConfig, humanBehavior);
        
        case 'comment':
          return await this.performComment(appConfig, text || '', humanBehavior);
        
        case 'reply':
          return await this.performReply(appConfig, text || '', target, humanBehavior);
        
        case 'follow':
          return await this.performFollow(appConfig, target, humanBehavior);
        
        case 'share':
          return await this.performShare(appConfig, humanBehavior);
        
        case 'scroll':
          return await this.performScroll(coordinates, humanBehavior);
        
        case 'tap':
          return await this.performTap(coordinates, humanBehavior);
        
        case 'swipe':
          return await this.performSwipe(coordinates, humanBehavior);
        
        default:
          return {
            success: false,
            error: `Action '${action}' is not supported`
          };
      }
    } catch (error) {
      return {
        success: false,
        error: `Action execution failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async launchApp(packageName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const adbCommand = spawn('adb', ['shell', 'monkey', '-p', packageName, '-c', 'android.intent.category.LAUNCHER', '1']);
      
      adbCommand.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Failed to launch app: ${packageName}`));
        }
      });
      
      adbCommand.on('error', (error) => {
        reject(error);
      });
    });
  }

  private async performLike(appConfig: AppConfig, humanBehavior: boolean): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      if (!appConfig.selectors.likeButton) {
        return { success: false, error: 'Like button selector not configured for this app' };
      }

      // Find and tap like button
      const tapResult = await this.tapBySelector(appConfig.selectors.likeButton);
      
      if (humanBehavior) {
        await this.humanDelay(500 + Math.random() * 1000);
      }

      return {
        success: tapResult,
        data: { action: 'like', selector: appConfig.selectors.likeButton }
      };
    } catch (error) {
      return {
        success: false,
        error: `Like action failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async performComment(appConfig: AppConfig, text: string, humanBehavior: boolean): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      if (!appConfig.selectors.commentButton || !appConfig.selectors.textInput) {
        return { success: false, error: 'Comment selectors not configured for this app' };
      }

      // Tap comment button
      await this.tapBySelector(appConfig.selectors.commentButton);
      
      if (humanBehavior) {
        await this.humanDelay(1000 + Math.random() * 1000);
      }

      // Enter text
      await this.enterText(appConfig.selectors.textInput, text, humanBehavior);
      
      // Submit comment (usually Enter or Send button)
      await this.pressKey('KEYCODE_ENTER');

      return {
        success: true,
        data: { action: 'comment', text: text.substring(0, 50) + '...' }
      };
    } catch (error) {
      return {
        success: false,
        error: `Comment action failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async performReply(appConfig: AppConfig, text: string, target?: string, humanBehavior?: boolean): Promise<{ success: boolean; data?: any; error?: string }> {
    // Similar to comment but with target-specific logic
    return await this.performComment(appConfig, text, humanBehavior || true);
  }

  private async performFollow(appConfig: AppConfig, target?: string, humanBehavior?: boolean): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      if (!appConfig.selectors.followButton) {
        return { success: false, error: 'Follow button selector not configured for this app' };
      }

      const tapResult = await this.tapBySelector(appConfig.selectors.followButton);
      
      if (humanBehavior) {
        await this.humanDelay(1000 + Math.random() * 2000);
      }

      return {
        success: tapResult,
        data: { action: 'follow', target }
      };
    } catch (error) {
      return {
        success: false,
        error: `Follow action failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async performShare(appConfig: AppConfig, humanBehavior: boolean): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      if (!appConfig.selectors.shareButton) {
        return { success: false, error: 'Share button selector not configured for this app' };
      }

      const tapResult = await this.tapBySelector(appConfig.selectors.shareButton);
      
      if (humanBehavior) {
        await this.humanDelay(500 + Math.random() * 1000);
      }

      return {
        success: tapResult,
        data: { action: 'share' }
      };
    } catch (error) {
      return {
        success: false,
        error: `Share action failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async performScroll(coordinates?: { x: number; y: number }, humanBehavior?: boolean): Promise<{ success: boolean; data?: any; error?: string }> {
    const startX = coordinates?.x || 500;
    const startY = coordinates?.y || 1000;
    const endY = startY - 800; // Scroll up

    return this.executeAdbCommand(['shell', 'input', 'swipe', startX.toString(), startY.toString(), startX.toString(), endY.toString(), '500']);
  }

  private async performTap(coordinates?: { x: number; y: number }, humanBehavior?: boolean): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!coordinates) {
      return { success: false, error: 'Coordinates required for tap action' };
    }

    return this.executeAdbCommand(['shell', 'input', 'tap', coordinates.x.toString(), coordinates.y.toString()]);
  }

  private async performSwipe(coordinates?: { x: number; y: number }, humanBehavior?: boolean): Promise<{ success: boolean; data?: any; error?: string }> {
    const startX = coordinates?.x || 500;
    const startY = coordinates?.y || 1000;
    const endX = startX + 300;
    const endY = startY;

    return this.executeAdbCommand(['shell', 'input', 'swipe', startX.toString(), startY.toString(), endX.toString(), endY.toString(), '300']);
  }

  private async tapBySelector(selector: string): Promise<boolean> {
    // Use UI Automator to find and tap element
    const result = await this.executeAdbCommand([
      'shell', 'uiautomator', 'runtest', 'uiautomator-stub.jar', '-c', 'com.github.uiautomatorstub.Stub',
      '-e', 'action', 'tap',
      '-e', 'selector', selector
    ]);
    
    return result.success;
  }

  private async enterText(selector: string, text: string, humanBehavior: boolean): Promise<boolean> {
    // First tap the input field
    await this.tapBySelector(selector);
    
    if (humanBehavior) {
      // Type with human-like delays
      for (const char of text) {
        await this.executeAdbCommand(['shell', 'input', 'text', char]);
        await this.sleep(50 + Math.random() * 100);
      }
    } else {
      await this.executeAdbCommand(['shell', 'input', 'text', `"${text}"`]);
    }
    
    return true;
  }

  private async pressKey(keyCode: string): Promise<boolean> {
    const result = await this.executeAdbCommand(['shell', 'input', 'keyevent', keyCode]);
    return result.success;
  }

  private async executeAdbCommand(args: string[]): Promise<{ success: boolean; data?: any; error?: string }> {
    return new Promise((resolve) => {
      const adbProcess = spawn('adb', args);
      let output = '';
      let error = '';

      adbProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      adbProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      adbProcess.on('close', (code) => {
        if (code === 0) {
          resolve({
            success: true,
            data: output.trim()
          });
        } else {
          resolve({
            success: false,
            error: error || `Command failed with code ${code}`
          });
        }
      });

      adbProcess.on('error', (err) => {
        resolve({
          success: false,
          error: err.message
        });
      });
    });
  }

  private async takeScreenshot(prefix: string): Promise<string> {
    try {
      const timestamp = Date.now();
      const filename = `${prefix}_${timestamp}.png`;
      const filepath = path.join(this.screenshotsDir, filename);
      
      await this.executeAdbCommand(['shell', 'screencap', '-p', `/sdcard/${filename}`]);
      await this.executeAdbCommand(['pull', `/sdcard/${filename}`, filepath]);
      await this.executeAdbCommand(['shell', 'rm', `/sdcard/${filename}`]);
      
      return filepath;
    } catch (error) {
      console.error('Screenshot failed:', error);
      return '';
    }
  }

  private async logAction(actionData: any): Promise<void> {
    try {
      const logEntry = `${JSON.stringify(actionData)}\n`;
      await fs.appendFile(this.logFile, logEntry);
    } catch (error) {
      console.error('Failed to log action:', error);
    }
  }

  private async humanDelay(baseDelay: number): Promise<void> {
    // Add random variation to mimic human behavior
    const variation = Math.random() * 0.5 + 0.75; // 75-125% of base delay
    const delay = Math.floor(baseDelay * variation);
    await this.sleep(delay);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getSupportedApps(): Promise<string[]> {
    return Object.keys(this.appConfigs);
  }

  async getAppConfig(appName: string): Promise<AppConfig | null> {
    return this.appConfigs[appName.toLowerCase()] || null;
  }

  async checkAdbConnection(): Promise<{ connected: boolean; devices: string[] }> {
    try {
      const result = await this.executeAdbCommand(['devices']);
      const devices = result.data ? result.data.split('\n').filter((line: string) => line.includes('\tdevice')).map((line: string) => line.split('\t')[0]) : [];
      
      return {
        connected: devices.length > 0,
        devices
      };
    } catch (error) {
      return {
        connected: false,
        devices: []
      };
    }
  }
}

export const mobileControlService = MobileControlService.getInstance();