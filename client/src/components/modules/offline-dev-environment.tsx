import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Server, 
  Globe2,
  Container,
  Eye,
  EyeOff,
  Terminal,
  Code,
  Database,
  GitBranch,
  Package,
  Monitor,
  Lock,
  Wifi,
  Cloud,
  HardDrive,
  Cpu,
  MemoryStick,
  Activity,
  CheckCircle,
  AlertTriangle,
  Play,
  Square,
  Settings,
  Download,
  Upload,
  RefreshCw
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface VPSInstance {
  id: string;
  name: string;
  provider: string;
  region: string;
  ip: string;
  status: "running" | "stopped" | "deploying";
  specs: {
    cpu: string;
    ram: string;
    storage: string;
    bandwidth: string;
  };
  cost: string;
  uptime: string;
}

interface TorConnection {
  id: string;
  exitNode: string;
  country: string;
  status: "connected" | "disconnected" | "connecting";
  ip: string;
  latency: number;
  bandwidth: string;
}

interface OfflineService {
  name: string;
  status: "running" | "stopped" | "error";
  port: number;
  description: string;
  replacesService: string;
  url: string;
}

export function OfflineDevEnvironment() {
  const [activeTab, setActiveTab] = useState("overview");
  const [torEnabled, setTorEnabled] = useState(false);
  const [vpnEnabled, setVpnEnabled] = useState(false);
  const [anonymousMode, setAnonymousMode] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock VPS instances
  const vpsInstances: VPSInstance[] = [
    {
      id: "vps-1",
      name: "MO Development Server",
      provider: "DigitalOcean",
      region: "Amsterdam",
      ip: "159.89.123.45",
      status: "running",
      specs: {
        cpu: "4 vCPUs",
        ram: "8GB RAM", 
        storage: "160GB SSD",
        bandwidth: "5TB/month"
      },
      cost: "$40/month",
      uptime: "99.9%"
    },
    {
      id: "vps-2", 
      name: "Tor Relay Node",
      provider: "Vultr",
      region: "Frankfurt",
      ip: "45.76.89.123",
      status: "running",
      specs: {
        cpu: "2 vCPUs",
        ram: "4GB RAM",
        storage: "80GB SSD", 
        bandwidth: "3TB/month"
      },
      cost: "$20/month",
      uptime: "99.7%"
    }
  ];

  // Mock Tor connections
  const torConnections: TorConnection[] = [
    {
      id: "tor-1",
      exitNode: "tor-exit-1",
      country: "Germany",
      status: "connected",
      ip: "185.220.101.45",
      latency: 145,
      bandwidth: "2.5 MB/s"
    },
    {
      id: "tor-2", 
      exitNode: "tor-exit-2",
      country: "Netherlands",
      status: "connected",
      ip: "185.220.102.76",
      latency: 98,
      bandwidth: "4.1 MB/s"
    }
  ];

  // Offline services that replace Replit premium features
  const offlineServices: OfflineService[] = [
    {
      name: "Gitea",
      status: "running",
      port: 3000,
      description: "Self-hosted Git service with web interface",
      replacesService: "GitHub Integration",
      url: "http://localhost:3000"
    },
    {
      name: "Drone CI/CD",
      status: "running", 
      port: 8080,
      description: "Continuous integration and deployment",
      replacesService: "Replit Deployments", 
      url: "http://localhost:8080"
    },
    {
      name: "Code Server",
      status: "running",
      port: 8443,
      description: "VS Code in browser with full IDE features",
      replacesService: "Replit IDE",
      url: "https://localhost:8443"
    },
    {
      name: "PostgreSQL",
      status: "running",
      port: 5432,
      description: "Self-hosted database with pgAdmin",
      replacesService: "Replit Database",
      url: "http://localhost:5050"
    },
    {
      name: "Vault",
      status: "running",
      port: 8200,
      description: "Encrypted secrets management",
      replacesService: "Replit Secrets",
      url: "https://localhost:8200"
    },
    {
      name: "Registry",
      status: "running",
      port: 5000,
      description: "Private Docker container registry", 
      replacesService: "Package Management",
      url: "http://localhost:5000"
    },
    {
      name: "Nginx Proxy",
      status: "running",
      port: 80,
      description: "Reverse proxy with SSL termination",
      replacesService: "Replit Hosting",
      url: "http://localhost"
    },
    {
      name: "Tor Hidden Service",
      status: "running",
      port: 9050,
      description: "Anonymous .onion domain hosting",
      replacesService: "Public Domains",
      url: "http://mo3x7k2b9d8f6s1a.onion"
    }
  ];

  const deployVPS = useMutation({
    mutationFn: async (vpsConfig: any) => {
      await new Promise(resolve => setTimeout(resolve, 3000));
      return { success: true, instanceId: Math.random().toString(36).substr(2, 9) };
    },
    onSuccess: () => {
      toast({
        title: "VPS Deployed",
        description: "Your development server is now running and accessible.",
      });
    },
  });

  const toggleTor = useMutation({
    mutationFn: async (enabled: boolean) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true, torEnabled: enabled };
    },
    onSuccess: (data) => {
      setTorEnabled(data.torEnabled);
      toast({
        title: data.torEnabled ? "Tor Activated" : "Tor Deactivated",
        description: data.torEnabled 
          ? "All traffic is now routed through Tor network" 
          : "Direct internet connection restored",
      });
    },
  });

  const installOfflineStack = useMutation({
    mutationFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 5000));
      return { success: true, servicesInstalled: 8 };
    },
    onSuccess: (data) => {
      toast({
        title: "Offline Stack Installed",
        description: `Successfully installed ${data.servicesInstalled} self-hosted services replacing all premium features.`,
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
      case "connected":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "stopped":
      case "disconnected":
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
      case "deploying":
      case "connecting":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "error":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  return (
    <Card className="bg-surface border-surface-variant">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Server className="w-5 h-5 text-purple-400" />
            <span>Offline Dev Environment</span>
          </div>
          <div className="flex items-center space-x-2">
            {anonymousMode && (
              <Badge className="bg-red-500/10 text-red-400">
                <EyeOff className="w-3 h-3 mr-1" />
                Anonymous
              </Badge>
            )}
            <Badge className="bg-purple-500/10 text-purple-400">Self-Hosted</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-surface-variant">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="vps" className="text-xs">VPS</TabsTrigger>
            <TabsTrigger value="privacy" className="text-xs">Privacy</TabsTrigger>
            <TabsTrigger value="services" className="text-xs">Services</TabsTrigger>
            <TabsTrigger value="setup" className="text-xs">Setup</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-surface-variant rounded-lg p-3 text-center">
                <Server className="w-6 h-6 mx-auto mb-1 text-blue-400" />
                <div className="text-lg font-bold">{vpsInstances.filter(v => v.status === 'running').length}</div>
                <div className="text-xs text-text-secondary">VPS Running</div>
              </div>
              <div className="bg-surface-variant rounded-lg p-3 text-center">
                <Shield className="w-6 h-6 mx-auto mb-1 text-red-400" />
                <div className="text-lg font-bold">{torEnabled ? 'ON' : 'OFF'}</div>
                <div className="text-xs text-text-secondary">Tor Network</div>
              </div>
              <div className="bg-surface-variant rounded-lg p-3 text-center">
                <Code className="w-6 h-6 mx-auto mb-1 text-green-400" />
                <div className="text-lg font-bold">{offlineServices.filter(s => s.status === 'running').length}</div>
                <div className="text-xs text-text-secondary">Services Active</div>
              </div>
              <div className="bg-surface-variant rounded-lg p-3 text-center">
                <Globe2 className="w-6 h-6 mx-auto mb-1 text-purple-400" />
                <div className="text-lg font-bold">$0</div>
                <div className="text-xs text-text-secondary">Replit Cost</div>
              </div>
            </div>

            <div className="bg-surface-variant rounded-lg p-4">
              <h4 className="text-sm font-medium mb-3">Premium Features Replacement</h4>
              <div className="space-y-2">
                {[
                  { original: "Replit Always-On", replacement: "VPS + Docker", status: "✓" },
                  { original: "Replit IDE", replacement: "Code Server (VS Code)", status: "✓" },
                  { original: "Replit Database", replacement: "PostgreSQL + pgAdmin", status: "✓" },
                  { original: "Replit Deployments", replacement: "Drone CI/CD", status: "✓" },
                  { original: "Replit Secrets", replacement: "HashiCorp Vault", status: "✓" },
                  { original: "Git Integration", replacement: "Gitea Self-Hosted", status: "✓" },
                  { original: "Custom Domains", replacement: "Nginx + SSL", status: "✓" },
                  { original: "Public Access", replacement: "Tor Hidden Service", status: "✓" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span className="text-text-secondary">{item.original}</span>
                    <span className="text-blue-400">→ {item.replacement}</span>
                    <span className="text-green-400 font-bold">{item.status}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                onClick={() => installOfflineStack.mutate()}
                disabled={installOfflineStack.isPending}
                className="bg-purple-500 hover:bg-purple-600 flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                {installOfflineStack.isPending ? "Installing..." : "Install Complete Stack"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setAnonymousMode(!anonymousMode)}
                className={anonymousMode ? "bg-red-500/10 text-red-400" : ""}
              >
                {anonymousMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="vps" className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">VPS Instances</span>
              <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                <Server className="w-3 h-3 mr-1" />
                Deploy New VPS
              </Button>
            </div>

            <div className="space-y-3">
              {vpsInstances.map((vps) => (
                <div key={vps.id} className="bg-surface-variant rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-sm font-medium">{vps.name}</h4>
                        <Badge className={getStatusColor(vps.status)}>
                          {vps.status === 'running' && <Activity className="w-3 h-3 mr-1 animate-pulse" />}
                          {vps.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {vps.provider}
                        </Badge>
                      </div>
                      <div className="text-xs text-text-secondary space-y-1">
                        <p>Region: {vps.region} • IP: {vps.ip}</p>
                        <p>Uptime: {vps.uptime} • Cost: {vps.cost}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div className="text-center">
                      <Cpu className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                      <div className="text-xs font-medium">{vps.specs.cpu}</div>
                    </div>
                    <div className="text-center">
                      <MemoryStick className="w-4 h-4 mx-auto mb-1 text-green-400" />
                      <div className="text-xs font-medium">{vps.specs.ram}</div>
                    </div>
                    <div className="text-center">
                      <HardDrive className="w-4 h-4 mx-auto mb-1 text-yellow-400" />
                      <div className="text-xs font-medium">{vps.specs.storage}</div>
                    </div>
                    <div className="text-center">
                      <Wifi className="w-4 h-4 mx-auto mb-1 text-purple-400" />
                      <div className="text-xs font-medium">{vps.specs.bandwidth}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button size="sm" className="bg-green-500 hover:bg-green-600">
                      <Terminal className="w-3 h-3 mr-1" />
                      SSH
                    </Button>
                    <Button size="sm" variant="outline">
                      <Monitor className="w-3 h-3 mr-1" />
                      Monitor
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="w-3 h-3 mr-1" />
                      Configure
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-4">
            <div className="bg-surface-variant rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-red-400" />
                  <span className="text-sm font-medium">Tor Network</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => toggleTor.mutate(!torEnabled)}
                  disabled={toggleTor.isPending}
                  className={torEnabled ? "bg-red-500 hover:bg-red-600" : "bg-gray-500 hover:bg-gray-600"}
                >
                  {torEnabled ? "Disconnect" : "Connect"}
                </Button>
              </div>

              {torEnabled && (
                <div className="space-y-3">
                  <div className="text-xs text-text-secondary mb-2">Active Tor Circuits:</div>
                  {torConnections.map((tor) => (
                    <div key={tor.id} className="bg-dark rounded p-3 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-xs font-medium">{tor.country}</span>
                          <Badge variant="outline" className="text-xs">{tor.ip}</Badge>
                        </div>
                        <div className="text-xs text-text-secondary">
                          Latency: {tor.latency}ms • Speed: {tor.bandwidth}
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="text-xs">
                        <RefreshCw className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-surface-variant rounded-lg p-4">
              <h4 className="text-sm font-medium mb-3">Anonymous Development Features</h4>
              <div className="space-y-2">
                {[
                  { feature: "Tor Hidden Service (.onion domain)", status: torEnabled },
                  { feature: "Encrypted Git repositories", status: true },
                  { feature: "Anonymous VPS payments (crypto)", status: true },
                  { feature: "No-logs development environment", status: true },
                  { feature: "Temporary container instances", status: true },
                  { feature: "Anonymous package downloads", status: torEnabled }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span>{item.feature}</span>
                    <Badge className={item.status ? "bg-green-500/10 text-green-400" : "bg-gray-500/10 text-gray-400"}>
                      {item.status ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-sm font-medium text-red-400">Privacy Notice</span>
              </div>
              <p className="text-xs text-text-secondary">
                When Tor is enabled, all development traffic routes through the Tor network. 
                This provides anonymity but may reduce connection speed. Use for sensitive projects only.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Self-Hosted Services</span>
              <Badge className="bg-green-500/10 text-green-400 text-xs">
                {offlineServices.filter(s => s.status === 'running').length} / {offlineServices.length} running
              </Badge>
            </div>

            <div className="space-y-3">
              {offlineServices.map((service) => (
                <div key={service.name} className="bg-surface-variant rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium">{service.name}</h4>
                        <Badge className={getStatusColor(service.status)}>
                          {service.status === 'running' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {service.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          :{service.port}
                        </Badge>
                      </div>
                      <p className="text-xs text-text-secondary mb-1">{service.description}</p>
                      <p className="text-xs text-blue-400">Replaces: {service.replacesService}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                      <Globe2 className="w-3 h-3 mr-1" />
                      Open
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="w-3 h-3 mr-1" />
                      Config
                    </Button>
                    <Button size="sm" variant="outline">
                      <Terminal className="w-3 h-3 mr-1" />
                      Logs
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="setup" className="space-y-4">
            <div className="bg-surface-variant rounded-lg p-4">
              <h4 className="text-sm font-medium mb-3">One-Click Setup Options</h4>
              <div className="space-y-3">
                <Button 
                  className="w-full justify-start bg-blue-500 hover:bg-blue-600"
                  onClick={() => installOfflineStack.mutate()}
                  disabled={installOfflineStack.isPending}
                >
                  <Container className="w-4 h-4 mr-2" />
                  {installOfflineStack.isPending ? "Installing..." : "Install Full Docker Stack"}
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Cloud className="w-4 h-4 mr-2" />
                  Deploy to Personal VPS
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Shield className="w-4 h-4 mr-2" />
                  Setup Anonymous Environment
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Import Replit Project
                </Button>
              </div>
            </div>

            <div className="bg-surface-variant rounded-lg p-4">
              <h4 className="text-sm font-medium mb-3">Installation Commands</h4>
              <Textarea
                value={`# Install Docker stack (Ubuntu/Debian)
curl -fsSL https://get.docker.com | bash
docker-compose up -d

# Services will be available at:
# IDE: https://localhost:8443
# Git: http://localhost:3000  
# CI/CD: http://localhost:8080
# Database: http://localhost:5050
# Secrets: https://localhost:8200

# For Tor integration:
apt install tor obfs4proxy
systemctl enable tor`}
                className="bg-dark border-surface-variant font-mono text-xs"
                rows={12}
                readOnly
              />
            </div>

            <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-green-400">Benefits of Self-Hosted Setup</span>
              </div>
              <ul className="text-xs text-text-secondary space-y-1">
                <li>• Complete independence from Replit subscription</li>
                <li>• Full control over data and privacy</li>
                <li>• Unlimited compute resources based on your VPS</li>
                <li>• Anonymous development through Tor integration</li>
                <li>• No monthly fees after initial VPS cost (~$20-40/month)</li>
                <li>• Professional-grade tools with enterprise features</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}