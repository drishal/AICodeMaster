import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, 
  Download, 
  Trash2, 
  Search, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PackageInfo {
  name: string;
  version: string;
  description: string;
  type: "nodejs" | "python" | "system";
  status: "installed" | "available" | "updating";
  size?: string;
  updated?: string;
}

export function PackageManager() {
  const [activeTab, setActiveTab] = useState("nodejs");
  const [searchQuery, setSearchQuery] = useState("");
  const [packageToInstall, setPackageToInstall] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock package data - would integrate with actual package managers
  const nodejsPackages: PackageInfo[] = [
    {
      name: "@tanstack/react-query",
      version: "5.45.1",
      description: "Powerful data synchronization for React",
      type: "nodejs",
      status: "installed",
      size: "2.1MB",
      updated: "2 days ago"
    },
    {
      name: "drizzle-orm",
      version: "0.35.3",
      description: "TypeScript ORM for SQL databases",
      type: "nodejs", 
      status: "installed",
      size: "1.8MB",
      updated: "1 week ago"
    },
    {
      name: "express",
      version: "4.21.1",
      description: "Fast, unopinionated web framework",
      type: "nodejs",
      status: "installed", 
      size: "512KB",
      updated: "3 days ago"
    },
    {
      name: "next",
      version: "15.1.0",
      description: "React framework for production",
      type: "nodejs",
      status: "available",
      size: "45MB"
    }
  ];

  const pythonPackages: PackageInfo[] = [
    {
      name: "moviepy",
      version: "2.1.1",
      description: "Video editing library for Python",
      type: "python",
      status: "installed",
      size: "12MB",
      updated: "5 days ago"
    },
    {
      name: "gtts",
      version: "2.5.4", 
      description: "Google Text-to-Speech library",
      type: "python",
      status: "installed",
      size: "2.3MB",
      updated: "1 week ago"
    },
    {
      name: "opencv-python",
      version: "4.10.0.84",
      description: "Computer vision library",
      type: "python",
      status: "installed",
      size: "78MB", 
      updated: "2 weeks ago"
    },
    {
      name: "tensorflow",
      version: "2.18.0",
      description: "Machine learning framework",
      type: "python",
      status: "available",
      size: "420MB"
    }
  ];

  const systemPackages: PackageInfo[] = [
    {
      name: "ffmpeg",
      version: "7.1.0",
      description: "Multimedia framework for video processing",
      type: "system",
      status: "installed",
      size: "125MB",
      updated: "1 month ago"
    },
    {
      name: "imagemagick", 
      version: "7.1.1-39",
      description: "Image manipulation utilities",
      type: "system",
      status: "installed",
      size: "89MB",
      updated: "2 weeks ago"
    },
    {
      name: "postgresql",
      version: "17.2",
      description: "Advanced relational database",
      type: "system",
      status: "installed",
      size: "280MB",
      updated: "active"
    },
    {
      name: "redis",
      version: "8.0.0", 
      description: "In-memory data structure store",
      type: "system",
      status: "available",
      size: "45MB"
    }
  ];

  const installPackage = useMutation({
    mutationFn: async ({ name, type }: { name: string; type: string }) => {
      // Would integrate with actual package manager API
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true, package: name };
    },
    onSuccess: (data) => {
      toast({
        title: "Package Installed",
        description: `${data.package} has been installed successfully.`,
      });
      setPackageToInstall("");
    },
  });

  const uninstallPackage = useMutation({
    mutationFn: async ({ name, type }: { name: string; type: string }) => {
      // Would integrate with actual package manager API
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, package: name };
    },
    onSuccess: (data) => {
      toast({
        title: "Package Uninstalled", 
        description: `${data.package} has been removed successfully.`,
      });
    },
  });

  const updatePackages = useMutation({
    mutationFn: async (type: string) => {
      // Would run actual package update commands
      await new Promise(resolve => setTimeout(resolve, 3000));
      return { success: true, updated: Math.floor(Math.random() * 5) + 1 };
    },
    onSuccess: (data) => {
      toast({
        title: "Packages Updated",
        description: `${data.updated} packages have been updated successfully.`,
      });
    },
  });

  const getPackages = (type: string) => {
    switch (type) {
      case "nodejs":
        return nodejsPackages;
      case "python": 
        return pythonPackages;
      case "system":
        return systemPackages;
      default:
        return [];
    }
  };

  const filteredPackages = getPackages(activeTab).filter(pkg =>
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "installed":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "updating":
        return <Clock className="w-4 h-4 text-blue-400" />;
      case "available":
        return <Download className="w-4 h-4 text-gray-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-orange-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "installed":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "updating":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "available":
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
      default:
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
    }
  };

  return (
    <Card className="bg-surface border-surface-variant">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-purple-400" />
            <span>Package Manager</span>
          </div>
          <Badge className="bg-purple-500/10 text-purple-400">Integrated</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <Input
              placeholder="Search packages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-dark border-surface-variant"
            />
          </div>
          <Button
            size="sm"
            onClick={() => updatePackages.mutate(activeTab)}
            disabled={updatePackages.isPending}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <RefreshCw className={`w-4 h-4 ${updatePackages.isPending ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-surface-variant">
            <TabsTrigger value="nodejs">Node.js</TabsTrigger>
            <TabsTrigger value="python">Python</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="nodejs" className="space-y-3">
            <div className="bg-surface-variant rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Package className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium">Install npm Package</span>
              </div>
              <div className="flex space-x-2">
                <Input
                  placeholder="Package name (e.g., lodash)"
                  value={packageToInstall}
                  onChange={(e) => setPackageToInstall(e.target.value)}
                  className="bg-dark border-surface-variant"
                />
                <Button
                  onClick={() => installPackage.mutate({ name: packageToInstall, type: "nodejs" })}
                  disabled={!packageToInstall.trim() || installPackage.isPending}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Install
                </Button>
              </div>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredPackages.map((pkg) => (
                <PackageItem
                  key={pkg.name}
                  package={pkg}
                  onUninstall={(name) => uninstallPackage.mutate({ name, type: "nodejs" })}
                  onInstall={(name) => installPackage.mutate({ name, type: "nodejs" })}
                  isLoading={installPackage.isPending || uninstallPackage.isPending}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="python" className="space-y-3">
            <div className="bg-surface-variant rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Package className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium">Install pip Package</span>
              </div>
              <div className="flex space-x-2">
                <Input
                  placeholder="Package name (e.g., requests)"
                  value={packageToInstall}
                  onChange={(e) => setPackageToInstall(e.target.value)}
                  className="bg-dark border-surface-variant"
                />
                <Button
                  onClick={() => installPackage.mutate({ name: packageToInstall, type: "python" })}
                  disabled={!packageToInstall.trim() || installPackage.isPending}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Install
                </Button>
              </div>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredPackages.map((pkg) => (
                <PackageItem
                  key={pkg.name}
                  package={pkg}
                  onUninstall={(name) => uninstallPackage.mutate({ name, type: "python" })}
                  onInstall={(name) => installPackage.mutate({ name, type: "python" })}
                  isLoading={installPackage.isPending || uninstallPackage.isPending}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-3">
            <div className="bg-surface-variant rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Package className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-medium">Install System Package</span>
              </div>
              <div className="flex space-x-2">
                <Input
                  placeholder="Package name (e.g., curl)"
                  value={packageToInstall}
                  onChange={(e) => setPackageToInstall(e.target.value)}
                  className="bg-dark border-surface-variant"
                />
                <Button
                  onClick={() => installPackage.mutate({ name: packageToInstall, type: "system" })}
                  disabled={!packageToInstall.trim() || installPackage.isPending}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Install
                </Button>
              </div>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredPackages.map((pkg) => (
                <PackageItem
                  key={pkg.name}
                  package={pkg}
                  onUninstall={(name) => uninstallPackage.mutate({ name, type: "system" })}
                  onInstall={(name) => installPackage.mutate({ name, type: "system" })}
                  isLoading={installPackage.isPending || uninstallPackage.isPending}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-green-400">Package Status</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-text-secondary">Node.js: </span>
              <span className="font-medium text-green-400">{nodejsPackages.filter(p => p.status === 'installed').length} installed</span>
            </div>
            <div>
              <span className="text-text-secondary">Python: </span>
              <span className="font-medium text-green-400">{pythonPackages.filter(p => p.status === 'installed').length} installed</span>
            </div>
            <div>
              <span className="text-text-secondary">System: </span>
              <span className="font-medium text-green-400">{systemPackages.filter(p => p.status === 'installed').length} installed</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface PackageItemProps {
  package: PackageInfo;
  onUninstall: (name: string) => void;
  onInstall: (name: string) => void;
  isLoading: boolean;
}

function PackageItem({ package: pkg, onUninstall, onInstall, isLoading }: PackageItemProps) {
  return (
    <div className="bg-surface-variant rounded-lg p-3 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-purple-500/20 rounded flex items-center justify-center">
          {getStatusIcon(pkg.status)}
        </div>
        <div>
          <h4 className="text-sm font-medium">{pkg.name}</h4>
          <p className="text-xs text-text-secondary">
            v{pkg.version} • {pkg.description}
          </p>
          {pkg.size && pkg.updated && (
            <p className="text-xs text-text-secondary">
              {pkg.size} • {pkg.updated}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Badge className={getStatusColor(pkg.status)}>
          {pkg.status}
        </Badge>
        {pkg.status === "installed" ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onUninstall(pkg.name)}
            disabled={isLoading}
            className="text-red-400 hover:text-red-300"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => onInstall(pkg.name)}
            disabled={isLoading}
            className="bg-green-500 hover:bg-green-600"
          >
            <Download className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

function getStatusIcon(status: string) {
  switch (status) {
    case "installed":
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    case "updating":
      return <Clock className="w-4 h-4 text-blue-400" />;
    case "available":
      return <Download className="w-4 h-4 text-gray-400" />;
    default:
      return <AlertCircle className="w-4 h-4 text-orange-400" />;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "installed":
      return "bg-green-500/10 text-green-400 border-green-500/20";
    case "updating":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "available":
      return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    default:
      return "bg-orange-500/10 text-orange-400 border-orange-500/20";
  }
}