import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingUp, Target, Zap, BarChart3, Settings } from "lucide-react";
import ScrollableCard from "@/components/ui/scrollable-card";

export function AdBudgetPlanner() {
  const [budget, setBudget] = useState("0");
  const [platform, setPlatform] = useState("organic");

  const budgetPlans = [
    { 
      name: "₹0 Organic", 
      budget: 0, 
      reach: "500-1.2K", 
      roas: "Organic growth", 
      strategy: "Content + Engagement",
      recommended: true
    },
    { 
      name: "₹500 Boost", 
      budget: 500, 
      reach: "2.5-5K", 
      roas: "2.5x estimated", 
      strategy: "Targeted ads + Organic",
      recommended: false
    },
    { 
      name: "₹2000 Scale", 
      budget: 2000, 
      reach: "8-15K", 
      roas: "3.2x estimated", 
      strategy: "Multi-platform campaigns",
      recommended: false
    }
  ];

  const roasOptimizations = [
    { type: "Audience Targeting", improvement: "+40%", status: "active" },
    { type: "Creative Testing", improvement: "+25%", status: "active" },
    { type: "Timing Optimization", improvement: "+15%", status: "pending" },
    { type: "Lookalike Audiences", improvement: "+30%", status: "upgrade" }
  ];

  const getROASColor = (roas: string) => {
    if (roas.includes("Organic")) return "text-green-400";
    if (parseFloat(roas) >= 3) return "text-blue-400";
    return "text-orange-400";
  };

  return (
    <Card className="bg-surface border-surface-variant module-enhanced">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <span>Ad Budget Auto-Planner Pro</span>
          </div>
          <Badge className="bg-green-500/10 text-green-400">₹0 Default</Badge>
        </CardTitle>
        <div className="card-description">
          Advanced budget optimization with AI-driven ROAS predictions, competitor analysis, 
          multi-platform allocation, seasonal adjustments, and real-time performance tracking.
        </div>
        <div className="feature-list">
          <div className="feature-tag">AI ROAS Predict</div>
          <div className="feature-tag">Competitor Analysis</div>
          <div className="feature-tag">Platform Allocation</div>
          <div className="feature-tag">Seasonal Adjust</div>
          <div className="feature-tag">Performance Track</div>
          <div className="feature-tag">Budget Optimizer</div>
          <div className="feature-tag">ROI Calculator</div>
          <div className="feature-tag">Spend Forecast</div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollableCard>
          <Tabs defaultValue="planner" className="w-full internal-tabs-container">
            <TabsList className="grid w-full grid-cols-3 bg-surface-variant tabs-list">
              <TabsTrigger value="planner">Budget Plans</TabsTrigger>
              <TabsTrigger value="roas">ROAS Optimizer</TabsTrigger>
              <TabsTrigger value="analytics">Performance</TabsTrigger>
            </TabsList>
          
          <TabsContent value="planner" className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Budget (₹0 for organic)"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="bg-dark border-surface-variant"
              />
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="bg-dark border-surface-variant">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="organic">Organic Only</SelectItem>
                  <SelectItem value="facebook">Facebook Ads</SelectItem>
                  <SelectItem value="instagram">Instagram Ads</SelectItem>
                  <SelectItem value="google">Google Ads</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              {budgetPlans.map((plan, index) => (
                <div
                  key={index}
                  className={`bg-surface-variant rounded-lg p-3 border ${
                    plan.recommended ? 'border-green-500/30' : 'border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium">{plan.name}</h4>
                      {plan.recommended && (
                        <Badge className="bg-green-500/10 text-green-400 text-xs">Recommended</Badge>
                      )}
                    </div>
                    <span className={`text-xs font-medium ${getROASColor(plan.roas)}`}>
                      {plan.roas}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-text-secondary">Reach: </span>
                      <span className="font-medium">{plan.reach}</span>
                    </div>
                    <div>
                      <span className="text-text-secondary">Strategy: </span>
                      <span className="font-medium">{plan.strategy}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <Button className="w-full bg-green-500 hover:bg-green-600">
              <Target className="w-4 h-4 mr-2" />
              Activate Budget Plan
            </Button>
          </TabsContent>
          
          <TabsContent value="roas" className="space-y-3">
            <div className="space-y-2">
              {roasOptimizations.map((opt, index) => (
                <div
                  key={index}
                  className="bg-surface-variant rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center">
                      <Zap className="w-3 h-3 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">{opt.type}</h4>
                      <p className="text-xs text-green-400">+{opt.improvement} ROAS improvement</p>
                    </div>
                  </div>
                  <Badge 
                    variant={opt.status === "active" ? "default" : opt.status === "upgrade" ? "destructive" : "secondary"} 
                    className="text-xs"
                  >
                    {opt.status}
                  </Badge>
                </div>
              ))}
            </div>
            
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">Zero Budget Optimizer</span>
              </div>
              <p className="text-xs text-text-secondary">
                AI automatically optimizes organic reach, engagement timing, and content strategy for maximum impact without ad spend.
              </p>
            </div>
            
            <Button className="w-full bg-blue-500 hover:bg-blue-600">
              <Settings className="w-4 h-4 mr-2" />
              Optimize ROAS
            </Button>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-variant rounded-lg p-3 text-center">
                <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <div className="text-sm font-medium">Current ROAS</div>
                <div className="text-xs text-text-secondary">Organic Growth</div>
              </div>
              <div className="bg-surface-variant rounded-lg p-3 text-center">
                <BarChart3 className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <div className="text-sm font-medium">Cost per Lead</div>
                <div className="text-xs text-text-secondary">₹0 (Organic)</div>
              </div>
            </div>
            
            <div className="text-center text-text-secondary py-4">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Performance analytics dashboard</p>
            </div>
          </TabsContent>
          </Tabs>
        </ScrollableCard>
      </CardContent>
    </Card>
  );
}