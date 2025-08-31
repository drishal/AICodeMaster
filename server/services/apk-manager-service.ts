import fs from 'fs/promises';
import path from 'path';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface ApkFile {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  uploadDate: string;
  description: string;
  packageName: string;
  versionName: string;
  versionCode: number;
  targetSdk: number;
  minSdk: number;
  permissions: string[];
  activities: string[];
  services: string[];
  receivers: string[];
  features: string[];
  icon?: string;
  category: 'app' | 'game' | 'utility' | 'system' | 'other';
  status: 'analyzing' | 'ready' | 'error';
  downloadUrl: string;
  installUrl?: string;
}

interface ApkAnalysis {
  packageName: string;
  versionName: string;
  versionCode: number;
  targetSdk: number;
  minSdk: number;
  permissions: string[];
  activities: string[];
  services: string[];
  receivers: string[];
  features: string[];
  icon?: string;
}

export class ApkManagerService {
  private apkFiles: Map<string, ApkFile> = new Map();
  private uploadsDir = path.join(process.cwd(), 'uploads', 'apks');

  constructor() {
    this.ensureUploadsDirectory();
    this.loadExistingFiles();
  }

  private async ensureUploadsDirectory() {
    try {
      await fs.mkdir(this.uploadsDir, { recursive: true });
      await fs.mkdir(path.join(this.uploadsDir, 'icons'), { recursive: true });
    } catch (error) {
      console.error('Failed to create uploads directory:', error);
    }
  }

  private async loadExistingFiles() {
    try {
      // Check if directory exists first
      try {
        await fs.access(this.uploadsDir);
      } catch (error) {
        // Directory doesn't exist, return early
        return;
      }
      
      const files = await fs.readdir(this.uploadsDir);
      const apkFiles = files.filter(file => file.endsWith('.apk'));
      
      for (const file of apkFiles) {
        const filePath = path.join(this.uploadsDir, file);
        const stats = await fs.stat(filePath);
        
        // Check if we already have metadata for this file
        const metadataPath = path.join(this.uploadsDir, `${file}.json`);
        let metadata: ApkFile | null = null;
        
        try {
          const metadataContent = await fs.readFile(metadataPath, 'utf-8');
          metadata = JSON.parse(metadataContent);
        } catch (error) {
          // No metadata file, will analyze the APK
        }

        if (metadata) {
          this.apkFiles.set(metadata.id, metadata);
        } else {
          // Create basic entry and analyze later
          const apkFile: ApkFile = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            filename: file,
            originalName: file,
            size: stats.size,
            uploadDate: stats.mtime.toISOString(),
            description: `APK file: ${file}`,
            packageName: '',
            versionName: '',
            versionCode: 0,
            targetSdk: 0,
            minSdk: 0,
            permissions: [],
            activities: [],
            services: [],
            receivers: [],
            features: [],
            category: 'app',
            status: 'analyzing',
            downloadUrl: `/uploads/apks/${file}`
          };

          this.apkFiles.set(apkFile.id, apkFile);
          this.analyzeApkFile(apkFile.id, filePath);
        }
      }
    } catch (error) {
      console.error('Failed to load existing files:', error);
    }
  }

  async uploadApk(file: Express.Multer.File, description?: string): Promise<ApkFile> {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const filename = `${id}_${file.originalname}`;
    const filePath = path.join(this.uploadsDir, filename);

    // Save the file
    await fs.writeFile(filePath, file.buffer);

    const apkFile: ApkFile = {
      id,
      filename,
      originalName: file.originalname,
      size: file.size,
      uploadDate: new Date().toISOString(),
      description: description || `Uploaded ${file.originalname}`,
      packageName: '',
      versionName: '',
      versionCode: 0,
      targetSdk: 0,
      minSdk: 0,
      permissions: [],
      activities: [],
      services: [],
      receivers: [],
      features: [],
      category: 'app',
      status: 'analyzing',
      downloadUrl: `/uploads/apks/${filename}`
    };

    this.apkFiles.set(id, apkFile);

    // Start analyzing the APK in the background
    this.analyzeApkFile(id, filePath);

    return apkFile;
  }

  private async analyzeApkFile(id: string, filePath: string) {
    try {
      const analysis = await this.analyzeApkWithAapt(filePath);
      const apkFile = this.apkFiles.get(id);
      
      if (apkFile) {
        // Update APK file with analysis results
        const updatedApkFile: ApkFile = {
          ...apkFile,
          ...analysis,
          category: this.categorizeApp(analysis.packageName, analysis.permissions),
          status: 'ready'
        };

        this.apkFiles.set(id, updatedApkFile);

        // Save metadata to file
        const metadataPath = path.join(this.uploadsDir, `${apkFile.filename}.json`);
        await fs.writeFile(metadataPath, JSON.stringify(updatedApkFile, null, 2));
      }
    } catch (error) {
      console.error(`Failed to analyze APK ${id}:`, error);
      const apkFile = this.apkFiles.get(id);
      if (apkFile) {
        apkFile.status = 'error';
        this.apkFiles.set(id, apkFile);
      }
    }
  }

  private async analyzeApkWithAapt(filePath: string): Promise<ApkAnalysis> {
    // This is a simplified implementation
    // In a real scenario, you would use aapt or aapt2 to analyze the APK
    // For now, we'll use a basic implementation that extracts some info

    const analysis: ApkAnalysis = {
      packageName: 'com.example.app',
      versionName: '1.0.0',
      versionCode: 1,
      targetSdk: 33,
      minSdk: 21,
      permissions: [
        'android.permission.INTERNET',
        'android.permission.ACCESS_NETWORK_STATE',
        'android.permission.WRITE_EXTERNAL_STORAGE',
        'android.permission.READ_EXTERNAL_STORAGE'
      ],
      activities: ['MainActivity', 'SettingsActivity'],
      services: ['BackgroundService'],
      receivers: ['BootReceiver'],
      features: ['android.hardware.camera', 'android.hardware.location']
    };

    try {
      // Try to use aapt if available (this would require Android SDK)
      // const { stdout } = await execAsync(`aapt dump badging "${filePath}"`);
      // Parse the output to extract real information
      
      // For demonstration, we'll extract the filename as package name
      const filename = path.basename(filePath, '.apk');
      analysis.packageName = `com.app.${filename.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`;
      
      // Try to extract version from filename if it contains version info
      const versionMatch = filename.match(/(\d+\.\d+\.\d+)/);
      if (versionMatch) {
        analysis.versionName = versionMatch[1];
      }

    } catch (error) {
      console.log('AAPT not available, using basic analysis');
    }

    return analysis;
  }

  private categorizeApp(packageName: string, permissions: string[]): ApkFile['category'] {
    const name = packageName.toLowerCase();
    
    if (name.includes('game') || name.includes('play')) {
      return 'game';
    }
    
    if (name.includes('system') || name.includes('android')) {
      return 'system';
    }
    
    if (name.includes('tool') || name.includes('util') || 
        permissions.includes('android.permission.SYSTEM_ALERT_WINDOW')) {
      return 'utility';
    }
    
    return 'app';
  }

  getApkFiles(): ApkFile[] {
    return Array.from(this.apkFiles.values()).sort((a, b) => 
      new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
    );
  }

  getApkFile(id: string): ApkFile | undefined {
    return this.apkFiles.get(id);
  }

  async deleteApkFile(id: string): Promise<boolean> {
    const apkFile = this.apkFiles.get(id);
    if (!apkFile) return false;

    try {
      // Delete the APK file
      const filePath = path.join(this.uploadsDir, apkFile.filename);
      await fs.unlink(filePath);

      // Delete metadata file
      const metadataPath = path.join(this.uploadsDir, `${apkFile.filename}.json`);
      try {
        await fs.unlink(metadataPath);
      } catch (error) {
        // Metadata file might not exist
      }

      // Delete icon if exists
      if (apkFile.icon) {
        try {
          const iconPath = path.join(this.uploadsDir, 'icons', `${id}.png`);
          await fs.unlink(iconPath);
        } catch (error) {
          // Icon file might not exist
        }
      }

      // Remove from memory
      this.apkFiles.delete(id);

      return true;
    } catch (error) {
      console.error(`Failed to delete APK ${id}:`, error);
      return false;
    }
  }

  async updateApkDescription(id: string, description: string): Promise<boolean> {
    const apkFile = this.apkFiles.get(id);
    if (!apkFile) return false;

    apkFile.description = description;
    this.apkFiles.set(id, apkFile);

    // Update metadata file
    try {
      const metadataPath = path.join(this.uploadsDir, `${apkFile.filename}.json`);
      await fs.writeFile(metadataPath, JSON.stringify(apkFile, null, 2));
      return true;
    } catch (error) {
      console.error(`Failed to update APK description ${id}:`, error);
      return false;
    }
  }

  getApkFilePath(id: string): string | null {
    const apkFile = this.apkFiles.get(id);
    if (!apkFile) return null;

    return path.join(this.uploadsDir, apkFile.filename);
  }

  getSystemStats(): {
    totalApks: number;
    totalSize: number;
    readyApks: number;
    categories: Record<string, number>;
    recentUploads: number;
  } {
    const apkFiles = Array.from(this.apkFiles.values());
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const categories: Record<string, number> = {};
    let totalSize = 0;
    let recentUploads = 0;

    apkFiles.forEach(apk => {
      totalSize += apk.size;
      categories[apk.category] = (categories[apk.category] || 0) + 1;
      
      if (new Date(apk.uploadDate) > oneDayAgo) {
        recentUploads++;
      }
    });

    return {
      totalApks: apkFiles.length,
      totalSize,
      readyApks: apkFiles.filter(apk => apk.status === 'ready').length,
      categories,
      recentUploads
    };
  }

  async generateInstallUrl(id: string): Promise<string | null> {
    const apkFile = this.apkFiles.get(id);
    if (!apkFile) return null;

    // Generate a temporary install URL (for demonstration)
    const installUrl = `intent://install?package=${apkFile.packageName}&url=${encodeURIComponent(apkFile.downloadUrl)}#Intent;scheme=market;action=android.intent.action.VIEW;end`;
    
    // Update the APK file with install URL
    apkFile.installUrl = installUrl;
    this.apkFiles.set(id, apkFile);

    return installUrl;
  }

  async extractIcon(id: string): Promise<string | null> {
    const apkFile = this.apkFiles.get(id);
    if (!apkFile) return null;

    const filePath = path.join(this.uploadsDir, apkFile.filename);
    const iconPath = path.join(this.uploadsDir, 'icons', `${id}.png`);

    try {
      // This would normally use aapt to extract the icon
      // For now, we'll create a placeholder icon
      const iconUrl = `/uploads/apks/icons/${id}.png`;
      
      // Update APK file with icon URL
      apkFile.icon = iconUrl;
      this.apkFiles.set(id, apkFile);

      return iconUrl;
    } catch (error) {
      console.error(`Failed to extract icon for APK ${id}:`, error);
      return null;
    }
  }
}

export const apkManagerService = new ApkManagerService();