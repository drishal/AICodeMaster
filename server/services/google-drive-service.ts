import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

export class GoogleDriveService {
  private drive: any;

  constructor() {
    // Initialize Google Drive API
    this.initializeDrive();
  }

  private async initializeDrive() {
    try {
      // Use service account authentication or OAuth2
      const auth = new google.auth.GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/drive.file'],
        // Note: In production, you'd need to provide credentials
        // For now, we'll create a simple auth flow
      });

      this.drive = google.drive({ version: 'v3', auth });
    } catch (error) {
      console.error('Failed to initialize Google Drive:', error);
    }
  }

  async uploadProjectToGoogleDrive(): Promise<{
    success: boolean;
    fileId?: string;
    webViewLink?: string;
    downloadLink?: string;
    error?: string;
  }> {
    try {
      const filePath = '/tmp/mo-app-development-complete.tar.gz';
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return {
          success: false,
          error: 'Project file not found. Please create the download package first.'
        };
      }

      const fileStats = fs.statSync(filePath);
      const fileName = 'MO-APP-DEVELOPMENT-Complete.tar.gz';

      // Upload file to Google Drive
      const fileMetadata = {
        name: fileName,
        description: 'Complete MO APP DEVELOPMENT platform with 32 modules - AI-powered mobile development and marketing automation',
      };

      const media = {
        mimeType: 'application/gzip',
        body: fs.createReadStream(filePath),
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id,name,webViewLink,webContentLink',
      });

      // Make file publicly accessible
      await this.drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      return {
        success: true,
        fileId: response.data.id,
        webViewLink: response.data.webViewLink,
        downloadLink: `https://drive.google.com/uc?id=${response.data.id}&export=download`,
      };

    } catch (error: any) {
      console.error('Google Drive upload error:', error);
      
      // If authentication fails, provide setup instructions
      if (error.message?.includes('auth') || error.code === 401) {
        return {
          success: false,
          error: 'Google Drive authentication required. Please configure API credentials.'
        };
      }

      return {
        success: false,
        error: error.message || 'Failed to upload to Google Drive'
      };
    }
  }

  async createShareableLink(fileId: string): Promise<string> {
    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        fields: 'webViewLink,webContentLink',
      });

      return `https://drive.google.com/uc?id=${fileId}&export=download`;
    } catch (error) {
      console.error('Failed to create shareable link:', error);
      throw error;
    }
  }

  // Alternative method using direct upload without authentication
  async createPublicUploadLink(): Promise<{
    success: boolean;
    uploadInstructions?: string;
    alternativeMethod?: string;
    error?: string;
  }> {
    return {
      success: true,
      uploadInstructions: `
To upload your MO APP DEVELOPMENT platform to Google Drive:

1. Download the project file from: http://localhost:5000/api/download/project
2. Go to drive.google.com
3. Click "New" → "File upload"
4. Select the downloaded mo-app-development-complete.tar.gz file
5. Once uploaded, right-click the file → "Get link"
6. Set sharing to "Anyone with the link"
7. Copy the shareable link

Your complete platform (390KB) includes all 32 modules and features.
      `,
      alternativeMethod: 'Manual upload via Google Drive web interface'
    };
  }
}

export const googleDriveService = new GoogleDriveService();