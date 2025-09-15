import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function FigmaImport() {
  const [figmaUrl, setFigmaUrl] = useState("");
  const [projectName, setProjectName] = useState("");
  const [selectedOptions, setSelectedOptions] = useState({
    components: true,
    designTokens: true,
    assets: false,
    responsive: true,
  });
  const [selectedFramework, setSelectedFramework] = useState("react");
  const [showAIHelper, setShowAIHelper] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/figma/import", data);
      return response.json();
    },
    onSuccess: (project) => {
      toast({
        title: "Import successful",
        description: `Successfully imported ${project.name} from Figma`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      // Reset form
      setFigmaUrl("");
      setProjectName("");
    },
    onError: (error: Error) => {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleImport = () => {
    if (!figmaUrl.trim()) {
      toast({
        title: "Figma URL required",
        description: "Please enter a valid Figma URL",
        variant: "destructive",
      });
      return;
    }

    importMutation.mutate({
      url: figmaUrl,
      projectName: projectName || "Figma Import",
      options: {
        ...selectedOptions,
        framework: selectedFramework,
      },
    });
  };

  const toggleOption = (option: keyof typeof selectedOptions) => {
    setSelectedOptions(prev => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  const frameworks = [
    { id: "react", name: "React", icon: "fab fa-react" },
    { id: "vue", name: "Vue", icon: "fab fa-vuejs" },
    { id: "angular", name: "Angular", icon: "fab fa-angular" },
    { id: "svelte", name: "Svelte", icon: "fas fa-code" },
  ];

  return (
    <div className="min-h-screen flex">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Import from Figma" onAIHelperToggle={() => setShowAIHelper(!showAIHelper)} />

        <div className="flex-1 overflow-auto">
          <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Import from Figma</h1>
              <p className="text-muted-foreground">
                Transform your Figma designs into production-ready React components
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Import Form */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <i className="fab fa-figma text-purple-600"></i>
                      <span>Figma Design</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="figma-url">Figma URL</Label>
                      <Input
                        id="figma-url"
                        placeholder="https://figma.com/file/..."
                        value={figmaUrl}
                        onChange={(e) => setFigmaUrl(e.target.value)}
                        data-testid="figma-url-input"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="project-name">Project Name</Label>
                      <Input
                        id="project-name"
                        placeholder="My Awesome Project"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        data-testid="project-name-input"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Import Options</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(selectedOptions).map(([key, value]) => (
                        <div key={key} className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                          <Checkbox
                            id={key}
                            checked={value}
                            onCheckedChange={() => toggleOption(key as keyof typeof selectedOptions)}
                            data-testid={`option-${key}`}
                          />
                          <div className="flex-1">
                            <Label htmlFor={key} className="text-sm font-medium cursor-pointer">
                              {key === 'designTokens' ? 'Design Tokens' : 
                               key.charAt(0).toUpperCase() + key.slice(1)}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              {key === 'components' && 'Import reusable components'}
                              {key === 'designTokens' && 'Extract colors, fonts, spacing'}
                              {key === 'assets' && 'Import images and icons'}
                              {key === 'responsive' && 'Generate responsive layouts'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Target Framework</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {frameworks.map((framework) => (
                        <Button
                          key={framework.id}
                          variant={selectedFramework === framework.id ? "default" : "outline"}
                          className="flex items-center space-x-2"
                          onClick={() => setSelectedFramework(framework.id)}
                          data-testid={`framework-${framework.id}`}
                        >
                          <i className={framework.icon}></i>
                          <span>{framework.name}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Button
                  onClick={handleImport}
                  className="w-full"
                  size="lg"
                  disabled={importMutation.isPending || !figmaUrl.trim()}
                  data-testid="import-button"
                >
                  {importMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner animate-spin mr-2"></i>
                      Importing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-download mr-2"></i>
                      Import & Generate
                    </>
                  )}
                </Button>
              </div>

              {/* Preview & Information */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <i className="fas fa-eye text-primary"></i>
                      <span>Import Preview</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                      {figmaUrl ? (
                        <div className="text-center">
                          <i className="fab fa-figma text-4xl text-purple-600 mb-4"></i>
                          <p className="text-sm text-muted-foreground">
                            Ready to import from Figma
                          </p>
                          <Badge variant="outline" className="mt-2">
                            {selectedFramework.toUpperCase()}
                          </Badge>
                        </div>
                      ) : (
                        <div className="text-center">
                          <i className="fas fa-upload text-4xl text-muted-foreground mb-4"></i>
                          <p className="text-muted-foreground">
                            Enter a Figma URL to see preview
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <i className="fas fa-info-circle text-blue-600"></i>
                      <span>What gets imported?</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <i className="fas fa-check-circle text-green-600 mt-1"></i>
                        <div>
                          <p className="text-sm font-medium">Components</p>
                          <p className="text-xs text-muted-foreground">
                            Reusable UI components with proper props
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <i className="fas fa-check-circle text-green-600 mt-1"></i>
                        <div>
                          <p className="text-sm font-medium">Design Tokens</p>
                          <p className="text-xs text-muted-foreground">
                            Colors, typography, spacing, and more
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <i className="fas fa-check-circle text-green-600 mt-1"></i>
                        <div>
                          <p className="text-sm font-medium">Responsive Layout</p>
                          <p className="text-xs text-muted-foreground">
                            Mobile-first responsive breakpoints
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <i className="fas fa-check-circle text-green-600 mt-1"></i>
                        <div>
                          <p className="text-sm font-medium">Clean Code</p>
                          <p className="text-xs text-muted-foreground">
                            Production-ready TypeScript + Tailwind CSS
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <i className="fas fa-lightbulb text-yellow-600"></i>
                      <span>Pro Tips</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm space-y-2">
                      <p>• Make sure your Figma file is publicly accessible</p>
                      <p>• Use consistent naming for components in Figma</p>
                      <p>• Group related elements for better component generation</p>
                      <p>• Use Figma's Auto Layout for responsive components</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
