import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Zap, Filter, Users, Send, Bot } from "lucide-react";

export function WhatsAppBot() {
  const [autoReply, setAutoReply] = useState("");
  const [filterKeyword, setFilterKeyword] = useState("");

  const messageFlows = [
    { id: 1, name: "Welcome Flow", status: "active", messages: 5 },
    { id: 2, name: "Product Inquiry", status: "idle", messages: 3 },
    { id: 3, name: "Support Flow", status: "active", messages: 7 }
  ];

  const filterRules = [
    { keyword: "price", action: "Auto-reply with catalog", active: true },
    { keyword: "order", action: "Forward to sales team", active: true },
    { keyword: "complaint", action: "Priority escalation", active: false }
  ];

  return (
    <div className="bg-white dark:bg-surface rounded-2xl shadow-xl max-h-[80vh] overflow-y-auto">
      <div className="sticky top-0 z-20 bg-white dark:bg-surface shadow p-4 rounded-t-2xl">
        <h1 className="text-xl font-bold flex items-center space-x-2">
          <MessageSquare className="w-6 h-6 text-green-500" />
          <span>WhatsApp Marketing Pro</span>
        </h1>
      </div>
      <Card className="bg-transparent border-none shadow-none m-4 mt-0">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-green-400" />
            <span>WhatsApp Marketing Pro</span>
          </div>
          <Badge className="bg-green-500/10 text-green-400">Smart Flows</Badge>
        </CardTitle>
        <div className="card-description">
          Advanced WhatsApp automation with AI chatbots, bulk messaging, contact segmentation, 
          lead qualification workflows, and multi-device campaign management.
        </div>
        <div className="feature-list">
          <div className="feature-tag">AI Chatbot</div>
          <div className="feature-tag">Bulk Messaging</div>
          <div className="feature-tag">Contact Segments</div>
          <div className="feature-tag">Lead Qualifier</div>
          <div className="feature-tag">Multi Device</div>
          <div className="feature-tag">Auto Responder</div>
          <div className="feature-tag">Group Manager</div>
          <div className="feature-tag">Media Scheduler</div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="flows" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-surface-variant">
            <TabsTrigger value="flows">Message Flows</TabsTrigger>
            <TabsTrigger value="filters">Filters</TabsTrigger>
            <TabsTrigger value="responder">Auto Responder</TabsTrigger>
          </TabsList>
          
          <TabsContent value="flows" className="space-y-3">
            <div className="space-y-2">
              {messageFlows.map((flow) => (
                <div
                  key={flow.id}
                  className="bg-surface-variant rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500/20 rounded flex items-center justify-center">
                      <Zap className="w-3 h-3 text-green-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">{flow.name}</h4>
                      <p className="text-xs text-text-secondary">{flow.messages} messages</p>
                    </div>
                  </div>
                  <Badge variant={flow.status === "active" ? "default" : "secondary"} className="text-xs">
                    {flow.status}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="mt-4 mb-6">
              <Button className="w-full bg-green-500 hover:bg-green-600">
                <Zap className="w-4 h-4 mr-2" />
                Create New Flow
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="filters" className="space-y-3">
            <div className="space-y-2">
              <div className="flex space-x-2">
                <Input
                  placeholder="Filter keyword..."
                  value={filterKeyword}
                  onChange={(e) => setFilterKeyword(e.target.value)}
                  className="bg-dark border-surface-variant"
                />
                <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                {filterRules.map((rule, index) => (
                  <div
                    key={index}
                    className="bg-surface-variant rounded-lg p-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-medium">"{rule.keyword}"</div>
                      <div className="text-xs text-text-secondary">{rule.action}</div>
                    </div>
                    <Badge variant={rule.active ? "default" : "secondary"} className="text-xs">
                      {rule.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="responder" className="space-y-3">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Auto-Reply Message</label>
                <Textarea
                  placeholder="Hi! Thanks for messaging us. We'll get back to you shortly..."
                  value={autoReply}
                  onChange={(e) => setAutoReply(e.target.value)}
                  className="bg-dark border-surface-variant"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-variant rounded-lg p-3 text-center">
                  <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <div className="text-sm font-medium">Active Chats</div>
                  <div className="text-xs text-text-secondary">23 conversations</div>
                </div>
                <div className="bg-surface-variant rounded-lg p-3 text-center">
                  <Bot className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <div className="text-sm font-medium">Auto Responses</div>
                  <div className="text-xs text-text-secondary">156 today</div>
                </div>
              </div>
              
              <div className="mt-4 mb-6">
                <Button className="w-full bg-green-500 hover:bg-green-600">
                  <Send className="w-4 h-4 mr-2" />
                  Save Auto Responder
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
    </div>
  );
}