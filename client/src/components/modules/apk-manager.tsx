import React, { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  Eye, 
  Share, 
  Smartphone,
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  FileArchive,
  Shield,
  Cpu,
  HardDrive,
  Calendar,
  User,
  Tag,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

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

export default function ApkManager() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedApk, setSelectedApk] = useState<ApkFile | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Fetch APK files
  const { data: apkFiles = [], isLoading } = useQuery({
    queryKey: ['/api/apk-files'],
    queryFn: async () => {
      const response = await fetch('/api/apk-files');
      if (!response.ok) throw new Error('Failed to fetch APK files');
      return response.json() as Promise<ApkFile[]>;
    }
  });

  // Upload APK mutation
  const uploadApkMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/apk-files/upload', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/apk-files'] });
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: () => {
      setIsUploading(false);
      setUploadProgress(0);
    }
  });

  // Delete APK mutation
  const deleteApkMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/apk-files/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Delete failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/apk-files'] });
    }
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.apk')) {
      alert('Please select a valid APK file');
      return;
    }

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      alert('File size must be less than 100MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('apk', file);
    formData.append('description', `Uploaded ${file.name}`);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      await uploadApkMutation.mutateAsync(formData);
      setUploadProgress(100);
    } catch (error) {
      clearInterval(progressInterval);
      
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'app': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'game': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'utility': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'system': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'analyzing': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  const totalSize = apkFiles.reduce((sum, apk) => sum + apk.size, 0);
  const readyApks = apkFiles.filter(apk => apk.status === 'ready').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">APK Manager</h2>
          <p className="text-muted-foreground">
            Upload, analyze, and manage Android APK files
          </p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".apk"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload APK
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total APKs</CardTitle>
            <Package className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apkFiles.length}</div>
            <p className="text-xs text-muted-foreground">
              {readyApks} ready, {apkFiles.length - readyApks} processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
            <HardDrive className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFileSize(totalSize)}</div>
            <p className="text-xs text-muted-foreground">Across all APK files</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Tag className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(apkFiles.map(a => a.category)).size}
            </div>
            <p className="text-xs text-muted-foreground">Different app types</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Upload</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {apkFiles.length > 0 ? 'Today' : 'None'}
            </div>
            <p className="text-xs text-muted-foreground">Most recent file</p>
          </CardContent>
        </Card>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <Alert>
          <Upload className="w-4 h-4" />
          <AlertDescription>
            <div className="flex items-center justify-between mb-2">
              <span>Uploading and analyzing APK...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} />
          </AlertDescription>
        </Alert>
      )}

      {/* APK Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apkFiles.map((apk) => (
          <Card key={apk.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    {apk.icon ? (
                      <img src={apk.icon} alt={apk.originalName} className="w-8 h-8 rounded" />
                    ) : (
                      <Smartphone className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{apk.originalName}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      {getStatusIcon(apk.status)}
                      <span>{apk.status}</span>
                    </CardDescription>
                  </div>
                </div>
                <Badge className={getCategoryColor(apk.category)}>
                  {apk.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {apk.description}
              </p>
              
              {/* APK Info */}
              {apk.status === 'ready' && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Version</div>
                    <div className="text-muted-foreground">{apk.versionName}</div>
                  </div>
                  <div>
                    <div className="font-medium">Size</div>
                    <div className="text-muted-foreground">{formatFileSize(apk.size)}</div>
                  </div>
                  <div>
                    <div className="font-medium">Min SDK</div>
                    <div className="text-muted-foreground">API {apk.minSdk}</div>
                  </div>
                  <div>
                    <div className="font-medium">Target SDK</div>
                    <div className="text-muted-foreground">API {apk.targetSdk}</div>
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                Uploaded: {new Date(apk.uploadDate).toLocaleDateString()}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setSelectedApk(apk);
                    setIsDetailsDialogOpen(true);
                  }}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Details
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.open(apk.downloadUrl, '_blank')}
                >
                  <Download className="w-3 h-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => deleteApkMutation.mutate(apk.id)}
                  disabled={deleteApkMutation.isPending}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {apkFiles.length === 0 && !isLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No APK files uploaded</h3>
            <p className="text-muted-foreground mb-4">Upload your first APK file to get started</p>
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              Upload APK
            </Button>
          </CardContent>
        </Card>
      )}

      {/* APK Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedApk?.icon ? (
                <img src={selectedApk.icon} alt={selectedApk.originalName} className="w-8 h-8 rounded" />
              ) : (
                <Smartphone className="w-6 h-6" />
              )}
              {selectedApk?.originalName}
            </DialogTitle>
            <DialogDescription>
              APK file details and analysis
            </DialogDescription>
          </DialogHeader>
          
          {selectedApk && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Package Name</Label>
                  <p className="text-sm text-muted-foreground">{selectedApk.packageName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Version</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedApk.versionName} ({selectedApk.versionCode})
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">File Size</Label>
                  <p className="text-sm text-muted-foreground">{formatFileSize(selectedApk.size)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Upload Date</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedApk.uploadDate).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Min SDK</Label>
                  <p className="text-sm text-muted-foreground">API {selectedApk.minSdk}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Target SDK</Label>
                  <p className="text-sm text-muted-foreground">API {selectedApk.targetSdk}</p>
                </div>
              </div>

              {/* Permissions */}
              {selectedApk.permissions.length > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Permissions</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedApk.permissions.map((permission, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {permission.replace('android.permission.', '')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Components */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Activities</Label>
                  <p className="text-sm text-muted-foreground">{selectedApk.activities.length}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Services</Label>
                  <p className="text-sm text-muted-foreground">{selectedApk.services.length}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Receivers</Label>
                  <p className="text-sm text-muted-foreground">{selectedApk.receivers.length}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Features</Label>
                  <p className="text-sm text-muted-foreground">{selectedApk.features.length}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  className="flex-1"
                  onClick={() => window.open(selectedApk.downloadUrl, '_blank')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download APK
                </Button>
                {selectedApk.installUrl && (
                  <Button 
                    variant="outline"
                    onClick={() => window.open(selectedApk.installUrl, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Install
                  </Button>
                )}
                <Button 
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedApk.downloadUrl);
                  }}
                >
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}