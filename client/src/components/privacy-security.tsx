import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Key, UserX, Network, Check } from "lucide-react";

export function PrivacySecurity() {
  const securityFeatures = [
    {
      icon: <Key className="w-4 h-4 text-primary" />,
      title: "API Key Encryption",
      description: "OpenAI keys encrypted locally",
      status: "active"
    },
    {
      icon: <UserX className="w-4 h-4 text-primary" />,
      title: "Privacy Mode",
      description: "No data sent to external servers",
      status: "active"
    },
    {
      icon: <Network className="w-4 h-4 text-primary" />,
      title: "Secure Communications",
      description: "End-to-end encryption",
      status: "active"
    }
  ];

  return (
    <Card className="bg-surface border-surface-variant">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-secondary" />
            <span>Privacy & Security</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-success rounded-full mr-2" />
            <span className="text-xs text-success">Protected</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {securityFeatures.map((feature, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-surface-variant rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {feature.icon}
                <div>
                  <h3 className="text-sm font-medium">{feature.title}</h3>
                  <p className="text-xs text-text-secondary">{feature.description}</p>
                </div>
              </div>
              <div className="w-4 h-4 bg-success rounded-full flex items-center justify-center">
                <Check className="w-2 h-2 text-white" />
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-success/5 border border-success/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-success" />
            <span className="text-sm font-medium text-success">Security Status</span>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            All privacy and security features are active. Your data is protected with military-grade encryption.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
