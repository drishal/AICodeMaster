import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Globe, 
  Plus, 
  Settings, 
  Eye, 
  Code, 
  Rocket, 
  Trash2, 
  Edit, 
  Copy,
  Monitor,
  Smartphone,
  Tablet,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  Users,
  Calendar,
  ExternalLink
} from "lucide-react";

interface Website {
  id: string;
  name: string;
  domain: string;
  template: string;
  status: 'active' | 'inactive' | 'building' | 'error';
  visitors: number;
  lastUpdated: string;
  description: string;
  technologies: string[];
  screenshot?: string;
  ssl: boolean;
  analytics: {
    pageViews: number;
    uniqueVisitors: number;
    bounceRate: number;
  };
}

const websiteTemplates = [
  {
    id: 'business',
    name: 'Business Landing',
    description: 'Professional business website with contact forms and service sections',
    tech: ['React', 'Tailwind CSS', 'Node.js'],
    preview: '/api/placeholder/business-template.jpg'
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'Creative portfolio showcasing projects and skills',
    tech: ['Next.js', 'TypeScript', 'Framer Motion'],
    preview: '/api/placeholder/portfolio-template.jpg'
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce',
    description: 'Online store with payment integration and product management',
    tech: ['React', 'Stripe', 'MongoDB'],
    preview: '/api/placeholder/ecommerce-template.jpg'
  },
  {
    id: 'blog',
    name: 'Blog/News',
    description: 'Content management system for blogs and news sites',
    tech: ['WordPress', 'PHP', 'MySQL'],
    preview: '/api/placeholder/blog-template.jpg'
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    description: 'Restaurant website with menu, reservations, and online ordering',
    tech: ['Vue.js', 'Express', 'PostgreSQL'],
    preview: '/api/placeholder/restaurant-template.jpg'
  },
  {
    id: 'saas',
    name: 'SaaS Platform',
    description: 'Software as a Service platform with user management and billing',
    tech: ['React', 'FastAPI', 'Redis'],
    preview: '/api/placeholder/saas-template.jpg'
  }
];

export default function MultipleWebsitesManager() {
  const [websites, setWebsites] = useState<Website[]>([
    {
      id: '1',
      name: 'MO Development Portfolio',
      domain: 'portfolio.modev.com',
      template: 'portfolio',
      status: 'active',
      visitors: 1247,
      lastUpdated: '2 hours ago',
      description: 'Professional portfolio showcasing mobile development projects',
      technologies: ['Next.js', 'TypeScript', 'Framer Motion'],
      ssl: true,
      analytics: {
        pageViews: 3421,
        uniqueVisitors: 1247,
        bounceRate: 32.5
      }
    },
    {
      id: '2',
      name: 'Business Automation Hub',
      domain: 'automation.modev.com',
      template: 'business',
      status: 'active',
      visitors: 892,
      lastUpdated: '1 day ago',
      description: 'Business services website for automation solutions',
      technologies: ['React', 'Tailwind CSS', 'Node.js'],
      ssl: true,
      analytics: {
        pageViews: 2156,
        uniqueVisitors: 892,
        bounceRate: 28.7
      }
    },
    {
      id: '3',
      name: 'Tech Blog',
      domain: 'blog.modev.com',
      template: 'blog',
      status: 'building',
      visitors: 0,
      lastUpdated: 'Building...',
      description: 'Technical blog about mobile development and AI',
      technologies: ['WordPress', 'PHP', 'MySQL'],
      ssl: false,
      analytics: {
        pageViews: 0,
        uniqueVisitors: 0,
        bounceRate: 0
      }
    }
  ]);

  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newWebsite, setNewWebsite] = useState({
    name: '',
    domain: '',
    template: '',
    description: ''
  });
  const [buildProgress, setBuildProgress] = useState(0);

  const handleCreateWebsite = async () => {
    if (!newWebsite.name || !newWebsite.domain || !newWebsite.template) return;

    const website: Website = {
      id: Date.now().toString(),
      name: newWebsite.name,
      domain: newWebsite.domain,
      template: newWebsite.template,
      status: 'building',
      visitors: 0,
      lastUpdated: 'Building...',
      description: newWebsite.description,
      technologies: websiteTemplates.find(t => t.id === newWebsite.template)?.tech || [],
      ssl: false,
      analytics: {
        pageViews: 0,
        uniqueVisitors: 0,
        bounceRate: 0
      }
    };

    setWebsites(prev => [...prev, website]);
    setIsCreateDialogOpen(false);
    setNewWebsite({ name: '', domain: '', template: '', description: '' });

    // Simulate build process
    setBuildProgress(0);
    const buildInterval = setInterval(() => {
      setBuildProgress(prev => {
        if (prev >= 100) {
          clearInterval(buildInterval);
          setWebsites(sites => sites.map(site => 
            site.id === website.id 
              ? { ...site, status: 'active', lastUpdated: 'Just now', ssl: true }
              : site
          ));
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const handleDeleteWebsite = (id: string) => {
    setWebsites(prev => prev.filter(site => site.id !== id));
  };

  const handleCloneWebsite = (website: Website) => {
    const clonedWebsite: Website = {
      ...website,
      id: Date.now().toString(),
      name: `${website.name} (Copy)`,
      domain: `copy-${website.domain}`,
      status: 'building',
      visitors: 0,
      ssl: false,
      analytics: {
        pageViews: 0,
        uniqueVisitors: 0,
        bounceRate: 0
      }
    };

    setWebsites(prev => [...prev, clonedWebsite]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'building': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'building': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Globe className="w-4 h-4 text-gray-500" />;
    }
  };

  const totalVisitors = websites.reduce((sum, site) => sum + site.visitors, 0);
  const activeWebsites = websites.filter(site => site.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Multiple Websites Manager</h2>
          <p className="text-muted-foreground">
            Create, manage, and deploy multiple websites from a single dashboard
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Website
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Website</DialogTitle>
              <DialogDescription>
                Choose a template and configure your new website
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="website-name">Website Name</Label>
                <Input
                  id="website-name"
                  value={newWebsite.name}
                  onChange={(e) => setNewWebsite(prev => ({...prev, name: e.target.value}))}
                  placeholder="My Awesome Website"
                />
              </div>
              <div>
                <Label htmlFor="website-domain">Domain</Label>
                <Input
                  id="website-domain"
                  value={newWebsite.domain}
                  onChange={(e) => setNewWebsite(prev => ({...prev, domain: e.target.value}))}
                  placeholder="mysite.com"
                />
              </div>
              <div>
                <Label htmlFor="website-template">Template</Label>
                <Select value={newWebsite.template} onValueChange={(value) => setNewWebsite(prev => ({...prev, template: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {websiteTemplates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="website-description">Description</Label>
                <Textarea
                  id="website-description"
                  value={newWebsite.description}
                  onChange={(e) => setNewWebsite(prev => ({...prev, description: e.target.value}))}
                  placeholder="Brief description of your website"
                  rows={3}
                />
              </div>
              <Button onClick={handleCreateWebsite} className="w-full">
                Create Website
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Websites</CardTitle>
            <Globe className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{websites.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeWebsites} active, {websites.length - activeWebsites} building/inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVisitors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all websites</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates Used</CardTitle>
            <Monitor className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(websites.map(w => w.template)).size}</div>
            <p className="text-xs text-muted-foreground">Different template types</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SSL Enabled</CardTitle>
            <CheckCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{websites.filter(w => w.ssl).length}</div>
            <p className="text-xs text-muted-foreground">Secure websites</p>
          </CardContent>
        </Card>
      </div>

      {/* Build Progress */}
      {buildProgress > 0 && buildProgress < 100 && (
        <Alert>
          <Clock className="w-4 h-4" />
          <AlertDescription>
            <div className="flex items-center justify-between mb-2">
              <span>Building website...</span>
              <span>{buildProgress}%</span>
            </div>
            <Progress value={buildProgress} />
          </AlertDescription>
        </Alert>
      )}

      {/* Websites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {websites.map((website) => (
          <Card key={website.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(website.status)}
                  <div>
                    <CardTitle className="text-lg">{website.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      {website.domain}
                    </CardDescription>
                  </div>
                </div>
                <Badge className={getStatusColor(website.status)}>
                  {website.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{website.description}</p>
              
              {/* Technologies */}
              <div className="flex flex-wrap gap-1">
                {website.technologies.map((tech, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>

              {/* Analytics */}
              {website.status === 'active' && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium">{website.analytics.pageViews.toLocaleString()}</div>
                    <div className="text-muted-foreground">Page Views</div>
                  </div>
                  <div>
                    <div className="font-medium">{website.visitors.toLocaleString()}</div>
                    <div className="text-muted-foreground">Visitors</div>
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                Last updated: {website.lastUpdated}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Code className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleCloneWebsite(website)}
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleDeleteWebsite(website.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Template Gallery */}
      <Card>
        <CardHeader>
          <CardTitle>Available Templates</CardTitle>
          <CardDescription>
            Choose from our collection of professional website templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {websiteTemplates.map((template) => (
              <div key={template.id} className="border rounded-lg p-4">
                <div className="aspect-video bg-muted rounded-md mb-3 flex items-center justify-center">
                  <Monitor className="w-8 h-8 text-muted-foreground" />
                </div>
                <h4 className="font-medium">{template.name}</h4>
                <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {template.tech.map((tech, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    setNewWebsite(prev => ({...prev, template: template.id}));
                    setIsCreateDialogOpen(true);
                  }}
                >
                  Use Template
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Management Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Analytics Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Total Page Views</span>
                <span className="font-medium">
                  {websites.reduce((sum, site) => sum + site.analytics.pageViews, 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Average Bounce Rate</span>
                <span className="font-medium">
                  {(websites.reduce((sum, site) => sum + site.analytics.bounceRate, 0) / websites.length).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Active Websites</span>
                <span className="font-medium">{activeWebsites}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Bulk Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Rocket className="w-4 h-4 mr-2" />
                Deploy All Websites
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <CheckCircle className="w-4 h-4 mr-2" />
                Enable SSL for All
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="w-4 h-4 mr-2" />
                Generate Analytics Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Maintenance
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}