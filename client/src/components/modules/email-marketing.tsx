import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Users, TrendingUp, Send, Calendar, BarChart3 } from "lucide-react";

export function EmailMarketing() {
  const [campaignName, setCampaignName] = useState("");

  const campaigns = [
    { id: 1, name: "Welcome Series", status: "running", sent: 1250, opened: 425, clicked: 89 },
    { id: 2, name: "Product Launch", status: "scheduled", sent: 0, opened: 0, clicked: 0 },
    { id: 3, name: "Weekly Newsletter", status: "draft", sent: 890, opened: 267, clicked: 45 }
  ];

  const segments = [
    { name: "New Subscribers", count: 340, growth: "+12%" },
    { name: "Active Users", count: 1250, growth: "+8%" },
    { name: "VIP Customers", count: 89, growth: "+15%" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running": return "text-green-400";
      case "scheduled": return "text-blue-400";
      case "draft": return "text-orange-400";
      default: return "text-gray-400";
    }
  };

  return (
    <div className="bg-white dark:bg-surface rounded-2xl shadow-xl max-h-[80vh] overflow-y-auto">
      <div className="sticky top-0 z-20 bg-white dark:bg-surface shadow p-4 rounded-t-2xl">
        <h1 className="text-xl font-bold flex items-center space-x-2">
          <Mail className="w-6 h-6 text-blue-500" />
          <span>Email Marketing Pro</span>
        </h1>
      </div>
      <Card className="bg-transparent border-none shadow-none m-4 mt-0">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mail className="w-5 h-5 text-blue-400" />
            <span>Email Marketing Pro</span>
          </div>
          <Badge className="bg-blue-500/10 text-blue-400">Campaigns</Badge>
        </CardTitle>
        <div className="card-description">
          Professional email marketing with AI subject lines, A/B testing, drip campaigns, 
          deliverability optimization, and advanced analytics with ROI tracking.
        </div>
        <div className="feature-list">
          <div className="feature-tag">AI Subject Lines</div>
          <div className="feature-tag">A/B Testing</div>
          <div className="feature-tag">Drip Campaigns</div>
          <div className="feature-tag">Deliverability</div>
          <div className="feature-tag">ROI Tracking</div>
          <div className="feature-tag">Template Builder</div>
          <div className="feature-tag">List Cleaner</div>
          <div className="feature-tag">Send Time AI</div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="campaigns" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-surface-variant">
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="segments">Segments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="campaigns" className="space-y-3">
            <div className="flex space-x-2">
              <Input
                placeholder="Campaign name..."
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="bg-dark border-surface-variant"
              />
              <Button className="bg-blue-500 hover:bg-blue-600">
                <Send className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="bg-surface-variant rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">{campaign.name}</h4>
                    <Badge className={`text-xs ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="text-text-secondary">Sent</div>
                      <div className="font-medium">{campaign.sent}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-text-secondary">Opened</div>
                      <div className="font-medium">{campaign.opened}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-text-secondary">Clicked</div>
                      <div className="font-medium">{campaign.clicked}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="action-buttons">
              <Button className="w-full bg-blue-500 hover:bg-blue-600">
                <Calendar className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="segments" className="space-y-3">
            <div className="space-y-2">
              {segments.map((segment, index) => (
                <div
                  key={index}
                  className="bg-surface-variant rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-purple-500/20 rounded flex items-center justify-center">
                      <Users className="w-3 h-3 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">{segment.name}</h4>
                      <p className="text-xs text-text-secondary">{segment.count} subscribers</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500/10 text-green-400 text-xs">
                    {segment.growth}
                  </Badge>
                </div>
              ))}
            </div>
            
            <div className="action-buttons">
              <Button className="w-full bg-purple-500 hover:bg-purple-600">
                <Users className="w-4 h-4 mr-2" />
                Create Segment
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-variant rounded-lg p-3 text-center">
                <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <div className="text-sm font-medium">Open Rate</div>
                <div className="text-xs text-text-secondary">34.2% avg</div>
              </div>
              <div className="bg-surface-variant rounded-lg p-3 text-center">
                <BarChart3 className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <div className="text-sm font-medium">Click Rate</div>
                <div className="text-xs text-text-secondary">7.1% avg</div>
              </div>
            </div>
            
            <div className="text-center text-text-secondary py-4">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Detailed analytics coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
    </div>
  );
}