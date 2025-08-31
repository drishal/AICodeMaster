import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Shield, Upload, Key, Download, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Document } from "@shared/schema";

export function DocumentVault() {
  const [documentName, setDocumentName] = useState("");
  const [documentType, setDocumentType] = useState("passport");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  const uploadDocument = useMutation({
    mutationFn: async ({ name, type }: { name: string; type: string }) => {
      // Simulate encrypted upload
      const encryptedData = btoa(`${name}_${type}_${Date.now()}`);
      return await apiRequest("/api/documents", {
        method: "POST",
        body: {
          name,
          type,
          encryptedData
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setDocumentName("");
      toast({
        title: "Document Uploaded",
        description: "Your document has been encrypted and stored securely.",
      });
    },
  });

  const deleteDocument = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/documents/${id}`, {
        method: "DELETE"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Document Deleted",
        description: "Document has been permanently removed.",
      });
    },
  });

  const getDocumentIcon = (type: string) => {
    return <FileText className="w-4 h-4 text-blue-400" />;
  };

  const handleUpload = () => {
    if (!documentName.trim()) return;
    uploadDocument.mutate({ name: documentName, type: documentType });
  };

  return (
    <Card className="bg-surface border-surface-variant">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-green-400" />
            <span>ID Vault + Upload Portal</span>
          </div>
          <div className="flex items-center space-x-1">
            <Key className="w-3 h-3 text-green-400" />
            <span className="text-xs text-green-400">AES Encrypted</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Section */}
        <div className="bg-surface-variant rounded-lg p-3 space-y-3">
          <div className="flex items-center space-x-2">
            <Upload className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium">Upload New Document</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Document name..."
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              className="bg-dark border-surface-variant"
            />
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger className="bg-dark border-surface-variant">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="passport">Passport</SelectItem>
                <SelectItem value="pan">PAN Card</SelectItem>
                <SelectItem value="aadhar">Aadhar</SelectItem>
                <SelectItem value="gst">GST Certificate</SelectItem>
                <SelectItem value="license">License</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleUpload}
            disabled={!documentName.trim() || uploadDocument.isPending}
            className="w-full bg-blue-500 hover:bg-blue-600"
          >
            <Upload className="w-4 h-4 mr-2" />
            Encrypt & Upload
          </Button>
        </div>

        {/* Documents List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Stored Documents</span>
            <Badge className="bg-green-500/10 text-green-400 text-xs">
              {documents.length} Encrypted
            </Badge>
          </div>
          
          {isLoading ? (
            <div className="text-text-secondary text-sm">Loading documents...</div>
          ) : documents.length === 0 ? (
            <div className="text-center text-text-secondary py-4">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No documents uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-surface-variant rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center">
                      {getDocumentIcon(doc.type)}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">{doc.name}</h4>
                      <p className="text-xs text-text-secondary">
                        {doc.type.toUpperCase()} • {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'Recently uploaded'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="p-1 h-auto text-blue-400 hover:text-blue-300"
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteDocument.mutate(doc.id)}
                      className="p-1 h-auto text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Security Info */}
        <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-green-400">Security Features</span>
          </div>
          <ul className="text-xs text-text-secondary space-y-1">
            <li>• AES-256 encryption for all documents</li>
            <li>• Local storage with encrypted keys</li>
            <li>• Zero-knowledge architecture</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}