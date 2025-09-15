import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { DesignToken, Project } from "@shared/schema";

const tokenCategories = [
  { id: 'colors', name: 'Colors', icon: 'fas fa-palette' },
  { id: 'typography', name: 'Typography', icon: 'fas fa-font' },
  { id: 'spacing', name: 'Spacing', icon: 'fas fa-ruler' },
  { id: 'borders', name: 'Borders', icon: 'fas fa-square' },
  { id: 'shadows', name: 'Shadows', icon: 'fas fa-adjust' },
  { id: 'animations', name: 'Animations', icon: 'fas fa-magic' },
];

export default function DesignTokens() {
  const [showAIHelper, setShowAIHelper] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("colors");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newToken, setNewToken] = useState({
    name: "",
    value: "",
    description: "",
    category: "colors",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: tokens, isLoading } = useQuery<DesignToken[]>({
    queryKey: ["/api/projects", selectedProject, "design-tokens"],
    enabled: !!selectedProject,
  });

  const createTokenMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", `/api/projects/${selectedProject}/design-tokens`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Token created",
        description: "Design token has been created successfully",
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/projects", selectedProject, "design-tokens"] 
      });
      setShowCreateDialog(false);
      setNewToken({ name: "", value: "", description: "", category: "colors" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create token",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createToken = () => {
    if (!newToken.name.trim() || !newToken.value.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in name and value fields",
        variant: "destructive",
      });
      return;
    }

    createTokenMutation.mutate(newToken);
  };

  const filteredTokens = tokens?.filter(token => 
    selectedCategory === 'all' || token.category === selectedCategory
  ) || [];

  const renderTokenValue = (token: DesignToken) => {
    switch (token.category) {
      case 'colors':
        return (
          <div className="flex items-center space-x-2">
            <div 
              className="w-6 h-6 rounded border"
              style={{ backgroundColor: token.value }}
            ></div>
            <code className="text-sm bg-muted px-2 py-1 rounded">{token.value}</code>
          </div>
        );
      case 'typography':
        return (
          <div className="space-y-1">
            <code className="text-sm bg-muted px-2 py-1 rounded block">{token.value}</code>
            {token.name.includes('family') && (
              <p style={{ fontFamily: token.value }} className="text-sm">Sample Text</p>
            )}
            {token.name.includes('size') && (
              <p style={{ fontSize: token.value }} className="text-sm">Sample Text</p>
            )}
            {token.name.includes('weight') && (
              <p style={{ fontWeight: token.value }} className="text-sm">Sample Text</p>
            )}
          </div>
        );
      case 'spacing':
        return (
          <div className="flex items-center space-x-2">
            <div 
              className="bg-primary/20 h-4"
              style={{ width: token.value }}
            ></div>
            <code className="text-sm bg-muted px-2 py-1 rounded">{token.value}</code>
          </div>
        );
      case 'borders':
        return (
          <div className="space-y-2">
            <div 
              className="w-16 h-16 bg-background"
              style={{ border: token.value }}
            ></div>
            <code className="text-sm bg-muted px-2 py-1 rounded">{token.value}</code>
          </div>
        );
      case 'shadows':
        return (
          <div className="space-y-2">
            <div 
              className="w-16 h-16 bg-background border"
              style={{ boxShadow: token.value }}
            ></div>
            <code className="text-sm bg-muted px-2 py-1 rounded">{token.value}</code>
          </div>
        );
      default:
        return <code className="text-sm bg-muted px-2 py-1 rounded">{token.value}</code>;
    }
  };

  const generateCSS = () => {
    if (!tokens) return "";

    const cssVars = tokens.map(token => 
      `  --${token.name.replace(/\s+/g, '-').toLowerCase()}: ${token.value};`
    ).join('\n');

    return `:root {\n${cssVars}\n}`;
  };

  const generateTailwindConfig = () => {
    if (!tokens) return "";

    const colorTokens = tokens.filter(t => t.category === 'colors');
    const spacingTokens = tokens.filter(t => t.category === 'spacing');
    const typographyTokens = tokens.filter(t => t.category === 'typography');

    let config = "module.exports = {\n  theme: {\n    extend: {\n";

    if (colorTokens.length > 0) {
      config += "      colors: {\n";
      colorTokens.forEach(token => {
        const key = token.name.replace(/\s+/g, '-').toLowerCase();
        config += `        '${key}': '${token.value}',\n`;
      });
      config += "      },\n";
    }

    if (spacingTokens.length > 0) {
      config += "      spacing: {\n";
      spacingTokens.forEach(token => {
        const key = token.name.replace(/\s+/g, '-').toLowerCase();
        config += `        '${key}': '${token.value}',\n`;
      });
      config += "      },\n";
    }

    if (typographyTokens.length > 0) {
      config += "      fontFamily: {\n";
      typographyTokens.filter(t => t.name.includes('family')).forEach(token => {
        const key = token.name.replace(/\s+/g, '-').toLowerCase().replace('-family', '');
        config += `        '${key}': [${token.value}],\n`;
      });
      config += "      },\n";
    }

    config += "    },\n  },\n}";
    return config;
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Design Tokens" onAIHelperToggle={() => setShowAIHelper(!showAIHelper)} />

        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">Design Tokens</h1>
              <p className="text-muted-foreground">Manage colors, typography, spacing, and more</p>
            </div>

            {/* Project Selection */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Select Project</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Select value={selectedProject} onValueChange={setSelectedProject}>
                      <SelectTrigger data-testid="project-select">
                        <SelectValue placeholder="Choose a project to manage design tokens" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects?.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedProject && (
                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                      <DialogTrigger asChild>
                        <Button data-testid="create-token-button">
                          <i className="fas fa-plus mr-2"></i>
                          New Token
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create Design Token</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Category</Label>
                            <Select 
                              value={newToken.category} 
                              onValueChange={(value) => setNewToken({...newToken, category: value})}
                            >
                              <SelectTrigger data-testid="token-category-select">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {tokenCategories.map((category) => (
                                  <SelectItem key={category.id} value={category.id}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                              value={newToken.name}
                              onChange={(e) => setNewToken({...newToken, name: e.target.value})}
                              placeholder="primary-blue"
                              data-testid="token-name-input"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Value</Label>
                            <Input
                              value={newToken.value}
                              onChange={(e) => setNewToken({...newToken, value: e.target.value})}
                              placeholder="#3B82F6"
                              data-testid="token-value-input"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Description (Optional)</Label>
                            <Textarea
                              value={newToken.description}
                              onChange={(e) => setNewToken({...newToken, description: e.target.value})}
                              placeholder="Primary brand color"
                              data-testid="token-description-input"
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" onClick={() => setShowCreateDialog(false)}>
                              Cancel
                            </Button>
                            <Button 
                              onClick={createToken} 
                              disabled={createTokenMutation.isPending}
                              data-testid="save-token-button"
                            >
                              {createTokenMutation.isPending ? "Creating..." : "Create Token"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardContent>
            </Card>

            {selectedProject ? (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Categories */}
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <i className="fas fa-list text-primary"></i>
                      <span>Categories</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant={selectedCategory === 'all' ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory('all')}
                      data-testid="category-all"
                    >
                      <i className="fas fa-layer-group mr-2"></i>
                      All Tokens
                      {tokens && (
                        <Badge variant="outline" className="ml-auto">
                          {tokens.length}
                        </Badge>
                      )}
                    </Button>
                    {tokenCategories.map((category) => {
                      const count = tokens?.filter(t => t.category === category.id).length || 0;
                      return (
                        <Button
                          key={category.id}
                          variant={selectedCategory === category.id ? 'default' : 'ghost'}
                          className="w-full justify-start"
                          onClick={() => setSelectedCategory(category.id)}
                          data-testid={`category-${category.id}`}
                        >
                          <i className={`${category.icon} mr-2`}></i>
                          {category.name}
                          {count > 0 && (
                            <Badge variant="outline" className="ml-auto">
                              {count}
                            </Badge>
                          )}
                        </Button>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Tokens Display */}
                <div className="lg:col-span-3">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>
                          {selectedCategory === 'all' 
                            ? 'All Design Tokens' 
                            : tokenCategories.find(c => c.id === selectedCategory)?.name
                          }
                        </CardTitle>
                        {filteredTokens.length > 0 && (
                          <div className="flex space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" data-testid="export-css-button">
                                  <i className="fas fa-file-code mr-2"></i>
                                  Export CSS
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>CSS Variables</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-96 font-mono">
                                    <code>{generateCSS()}</code>
                                  </pre>
                                  <Button
                                    onClick={() => {
                                      navigator.clipboard.writeText(generateCSS());
                                      toast({
                                        title: "Copied to clipboard",
                                        description: "CSS variables copied to clipboard",
                                      });
                                    }}
                                    data-testid="copy-css-button"
                                  >
                                    <i className="fas fa-copy mr-2"></i>
                                    Copy to Clipboard
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" data-testid="export-tailwind-button">
                                  <i className="fas fa-wind mr-2"></i>
                                  Tailwind Config
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Tailwind Config</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-96 font-mono">
                                    <code>{generateTailwindConfig()}</code>
                                  </pre>
                                  <Button
                                    onClick={() => {
                                      navigator.clipboard.writeText(generateTailwindConfig());
                                      toast({
                                        title: "Copied to clipboard",
                                        description: "Tailwind config copied to clipboard",
                                      });
                                    }}
                                    data-testid="copy-tailwind-button"
                                  >
                                    <i className="fas fa-copy mr-2"></i>
                                    Copy to Clipboard
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {filteredTokens.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="tokens-grid">
                          {filteredTokens.map((token) => (
                            <Card key={token.id} className="border" data-testid={`token-${token.id}`}>
                              <CardContent className="p-4">
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium">{token.name}</h4>
                                    <Badge variant="outline" className="text-xs">
                                      {token.category}
                                    </Badge>
                                  </div>
                                  
                                  <div>
                                    {renderTokenValue(token)}
                                  </div>
                                  
                                  {token.description && (
                                    <p className="text-sm text-muted-foreground">
                                      {token.description}
                                    </p>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <i className="fas fa-palette text-6xl text-muted-foreground mb-4"></i>
                          <h3 className="text-xl font-semibold mb-2">No tokens yet</h3>
                          <p className="text-muted-foreground mb-6">
                            Create your first design token to get started
                          </p>
                          <Button onClick={() => setShowCreateDialog(true)} data-testid="create-first-token-button">
                            <i className="fas fa-plus mr-2"></i>
                            Create First Token
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <i className="fas fa-project-diagram text-6xl text-muted-foreground mb-4"></i>
                <h3 className="text-xl font-semibold mb-2">Select a project</h3>
                <p className="text-muted-foreground">
                  Choose a project to view and manage its design tokens
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
