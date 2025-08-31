import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Users, Mail, Phone, Download, Shield } from "lucide-react";
import ScrollableCard from "@/components/ui/scrollable-card";

export function DataAcquisition() {
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [leadCount, setLeadCount] = useState("");

  const dataSources = [
    { name: "LinkedIn API", type: "Professional", leads: "2,340", status: "active", compliance: "GDPR" },
    { name: "Facebook Forms", type: "Social", leads: "1,890", status: "active", compliance: "CCPA" },
    { name: "Contact Forms", type: "Website", leads: "956", status: "paused", compliance: "Consent" }
  ];

  const collectionMethods = [
    { method: "Ethical Scraping", description: "Public data with consent", icon: Shield },
    { method: "API Integration", description: "Official platform APIs", icon: Database },
    { method: "Form Collection", description: "Opt-in web forms", icon: Mail },
    { method: "Survey Tools", description: "Interactive surveys", icon: Users }
  ];

  const getStatusColor = (status: string) => {
    return status === "active" ? "text-green-400" : "text-orange-400";
  };

  return (
    <Card className="bg-surface border-surface-variant module-enhanced">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-400" />
            <span>Data Acquisition Tool Pro</span>
          </div>
          <div className="flex items-center space-x-1">
            <Shield className="w-3 h-3 text-green-400" />
            <span className="text-xs text-green-400">Ethical</span>
          </div>
        </CardTitle>
        <div className="card-description">
          Advanced data acquisition with ethical scraping, API integrations, 
          GDPR compliance, consent management, and comprehensive lead qualification.
        </div>
        <div className="feature-list">
          <div className="feature-tag">Ethical Scraping</div>
          <div className="feature-tag">API Integration</div>
          <div className="feature-tag">GDPR Compliant</div>
          <div className="feature-tag">Consent Track</div>
          <div className="feature-tag">Lead Qualify</div>
          <div className="feature-tag">Auto Export</div>
          <div className="feature-tag">Real Time</div>
          <div className="feature-tag">Quality Score</div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollableCard>
          <Tabs defaultValue="sources" className="w-full internal-tabs-container">
            <TabsList className="grid w-full grid-cols-3 bg-surface-variant tabs-list">
              <TabsTrigger value="sources">Data Sources</TabsTrigger>
              <TabsTrigger value="methods">Methods</TabsTrigger>
              <TabsTrigger value="collection">Collection</TabsTrigger>
            </TabsList>
          
          <TabsContent value="sources" className="space-y-3">
            <div className="space-y-2">
              {dataSources.map((source, index) => (
                <div
                  key={index}
                  className="bg-surface-variant rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-medium">{source.name}</h4>
                      <p className="text-xs text-text-secondary">{source.type} • {source.compliance} Compliant</p>
                    </div>
                    <Badge className={`text-xs ${getStatusColor(source.status)}`}>
                      {source.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs">
                      <span className="text-text-secondary">Leads: </span>
                      <span className="font-medium">{source.leads}</span>
                    </div>
                    <Button size="sm" variant="ghost" className="p-1 h-auto">
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <Button className="w-full bg-blue-500 hover:bg-blue-600">
              <Database className="w-4 h-4 mr-2" />
              Add Data Source
            </Button>
          </TabsContent>
          
          <TabsContent value="methods" className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {collectionMethods.map((method, index) => (
                <div
                  key={index}
                  className="bg-surface-variant rounded-lg p-3 text-center"
                >
                  <method.icon className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <h4 className="text-sm font-medium mb-1">{method.method}</h4>
                  <p className="text-xs text-text-secondary">{method.description}</p>
                </div>
              ))}
            </div>
            
            <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-green-400">Compliance Features</span>
              </div>
              <ul className="text-xs text-text-secondary space-y-1">
                <li>• GDPR & CCPA compliant data collection</li>
                <li>• Automatic consent tracking</li>
                <li>• Opt-out management system</li>
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="collection" className="space-y-3">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="API endpoint..."
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                  className="bg-dark border-surface-variant"
                />
                <Input
                  placeholder="Target leads..."
                  value={leadCount}
                  onChange={(e) => setLeadCount(e.target.value)}
                  className="bg-dark border-surface-variant"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-variant rounded-lg p-3 text-center">
                  <Mail className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <div className="text-sm font-medium">Email Leads</div>
                  <div className="text-xs text-text-secondary">5,186 collected</div>
                </div>
                <div className="bg-surface-variant rounded-lg p-3 text-center">
                  <Phone className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <div className="text-sm font-medium">Phone Numbers</div>
                  <div className="text-xs text-text-secondary">2,943 collected</div>
                </div>
              </div>
              
              <Button className="w-full bg-blue-500 hover:bg-blue-600">
                <Database className="w-4 h-4 mr-2" />
                Start Collection
              </Button>
            </div>
          </TabsContent>
          </Tabs>
        </ScrollableCard>
      </CardContent>
    </Card>
  );
}