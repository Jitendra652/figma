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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { ApiEndpoint } from "@shared/schema";

interface TestResult {
  status: number;
  statusText: string;
  headers: { [key: string]: string };
  data: any;
  duration: number;
  timestamp: string;
}

export default function ApiTester() {
  const [showAIHelper, setShowAIHelper] = useState(false);
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState("{}");
  const [body, setBody] = useState("");
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [endpointName, setEndpointName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: savedEndpoints, isLoading: endpointsLoading } = useQuery<ApiEndpoint[]>({
    queryKey: ["/api/api-endpoints"],
  });

  const saveEndpointMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/api-endpoints", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Endpoint saved",
        description: "API endpoint has been saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/api-endpoints"] });
      setShowSaveDialog(false);
      setEndpointName("");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save endpoint",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const testApi = async () => {
    if (!url.trim()) {
      toast({
        title: "URL required",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const startTime = Date.now();

    try {
      let parsedHeaders = {};
      try {
        parsedHeaders = JSON.parse(headers);
      } catch (e) {
        // Invalid JSON, use empty headers
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...parsedHeaders,
        },
        body: method !== 'GET' && body ? body : undefined,
      });

      const duration = Date.now() - startTime;
      const responseHeaders: { [key: string]: string } = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      let responseData;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      setTestResult({
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        data: responseData,
        duration,
        timestamp: new Date().toISOString(),
      });

      toast({
        title: "Request completed",
        description: `${response.status} ${response.statusText} (${duration}ms)`,
        variant: response.ok ? "default" : "destructive",
      });
    } catch (error: any) {
      const duration = Date.now() - startTime;
      setTestResult({
        status: 0,
        statusText: "Network Error",
        headers: {},
        data: error.message,
        duration,
        timestamp: new Date().toISOString(),
      });

      toast({
        title: "Request failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadEndpoint = (endpoint: ApiEndpoint) => {
    setMethod(endpoint.method);
    setUrl(endpoint.url);
    setHeaders(JSON.stringify(endpoint.headers || {}, null, 2));
    setBody(endpoint.body || "");
  };

  const saveEndpoint = () => {
    if (!endpointName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for this endpoint",
        variant: "destructive",
      });
      return;
    }

    let parsedHeaders = {};
    try {
      parsedHeaders = JSON.parse(headers);
    } catch (e) {
      // Invalid JSON, use empty headers
    }

    saveEndpointMutation.mutate({
      name: endpointName,
      method,
      url,
      headers: parsedHeaders,
      body: body || null,
    });
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "text-green-600";
    if (status >= 400 && status < 500) return "text-yellow-600";
    if (status >= 500) return "text-red-600";
    return "text-muted-foreground";
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="API Tester" onAIHelperToggle={() => setShowAIHelper(!showAIHelper)} />

        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">API Tester</h1>
              <p className="text-muted-foreground">Test and debug API endpoints with ease</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Saved Endpoints */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <i className="fas fa-bookmark text-primary"></i>
                    <span>Saved Endpoints</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    {savedEndpoints && savedEndpoints.length > 0 ? (
                      <div className="space-y-2">
                        {savedEndpoints.map((endpoint) => (
                          <div
                            key={endpoint.id}
                            className="p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer"
                            onClick={() => loadEndpoint(endpoint)}
                            data-testid={`endpoint-${endpoint.id}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="outline" className="text-xs">
                                {endpoint.method}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium truncate">{endpoint.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{endpoint.url}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <i className="fas fa-bookmark text-4xl mb-2"></i>
                        <p className="text-sm">No saved endpoints</p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* API Tester */}
              <div className="lg:col-span-3 space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Request Configuration</CardTitle>
                      <div className="flex space-x-2">
                        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" data-testid="save-endpoint-button">
                              <i className="fas fa-save mr-2"></i>
                              Save
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Save Endpoint</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Endpoint Name</Label>
                                <Input
                                  value={endpointName}
                                  onChange={(e) => setEndpointName(e.target.value)}
                                  placeholder="Enter endpoint name"
                                  data-testid="endpoint-name-input"
                                />
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button variant="ghost" onClick={() => setShowSaveDialog(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={saveEndpoint} disabled={saveEndpointMutation.isPending}>
                                  {saveEndpointMutation.isPending ? "Saving..." : "Save"}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          onClick={testApi}
                          disabled={isLoading}
                          data-testid="test-api-button"
                        >
                          {isLoading ? (
                            <>
                              <i className="fas fa-spinner animate-spin mr-2"></i>
                              Testing...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-play mr-2"></i>
                              Send Request
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Method and URL */}
                    <div className="flex space-x-4">
                      <div className="w-32">
                        <Label>Method</Label>
                        <Select value={method} onValueChange={setMethod}>
                          <SelectTrigger data-testid="method-select">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="GET">GET</SelectItem>
                            <SelectItem value="POST">POST</SelectItem>
                            <SelectItem value="PUT">PUT</SelectItem>
                            <SelectItem value="PATCH">PATCH</SelectItem>
                            <SelectItem value="DELETE">DELETE</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1">
                        <Label>URL</Label>
                        <Input
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          placeholder="https://api.example.com/endpoint"
                          data-testid="url-input"
                        />
                      </div>
                    </div>

                    {/* Headers and Body */}
                    <Tabs defaultValue="headers" className="space-y-4">
                      <TabsList>
                        <TabsTrigger value="headers">Headers</TabsTrigger>
                        <TabsTrigger value="body" disabled={method === 'GET'}>Body</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="headers" className="space-y-2">
                        <Label>Headers (JSON)</Label>
                        <Textarea
                          value={headers}
                          onChange={(e) => setHeaders(e.target.value)}
                          placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
                          className="font-mono text-sm min-h-32"
                          data-testid="headers-input"
                        />
                      </TabsContent>
                      
                      <TabsContent value="body" className="space-y-2">
                        <Label>Request Body</Label>
                        <Textarea
                          value={body}
                          onChange={(e) => setBody(e.target.value)}
                          placeholder='{"key": "value"}'
                          className="font-mono text-sm min-h-32"
                          data-testid="body-input"
                        />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Response */}
                {testResult && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Response</span>
                        <div className="flex items-center space-x-4">
                          <Badge variant="outline" className={getStatusColor(testResult.status)}>
                            {testResult.status} {testResult.statusText}
                          </Badge>
                          <Badge variant="outline">
                            {testResult.duration}ms
                          </Badge>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="body" className="space-y-4">
                        <TabsList>
                          <TabsTrigger value="body">Response Body</TabsTrigger>
                          <TabsTrigger value="headers">Response Headers</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="body">
                          <div className="space-y-2">
                            <Label>Response Body</Label>
                            <ScrollArea className="h-96">
                              <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto font-mono" data-testid="response-body">
                                {typeof testResult.data === 'string' 
                                  ? testResult.data 
                                  : JSON.stringify(testResult.data, null, 2)}
                              </pre>
                            </ScrollArea>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="headers">
                          <div className="space-y-2">
                            <Label>Response Headers</Label>
                            <ScrollArea className="h-96">
                              <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto font-mono" data-testid="response-headers">
                                {JSON.stringify(testResult.headers, null, 2)}
                              </pre>
                            </ScrollArea>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                )}

                {/* Quick Examples */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <i className="fas fa-lightbulb text-yellow-600"></i>
                      <span>Quick Examples</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button
                        variant="outline"
                        className="justify-start h-auto p-4"
                        onClick={() => {
                          setMethod("GET");
                          setUrl("https://jsonplaceholder.typicode.com/posts/1");
                          setHeaders('{"Content-Type": "application/json"}');
                          setBody("");
                        }}
                        data-testid="example-get-button"
                      >
                        <div className="text-left">
                          <p className="font-medium">GET Example</p>
                          <p className="text-sm text-muted-foreground">Fetch a JSON post</p>
                        </div>
                      </Button>

                      <Button
                        variant="outline"
                        className="justify-start h-auto p-4"
                        onClick={() => {
                          setMethod("POST");
                          setUrl("https://jsonplaceholder.typicode.com/posts");
                          setHeaders('{"Content-Type": "application/json"}');
                          setBody('{\n  "title": "foo",\n  "body": "bar",\n  "userId": 1\n}');
                        }}
                        data-testid="example-post-button"
                      >
                        <div className="text-left">
                          <p className="font-medium">POST Example</p>
                          <p className="text-sm text-muted-foreground">Create a new post</p>
                        </div>
                      </Button>

                      <Button
                        variant="outline"
                        className="justify-start h-auto p-4"
                        onClick={() => {
                          setMethod("GET");
                          setUrl("https://httpstat.us/200");
                          setHeaders('{}');
                          setBody("");
                        }}
                        data-testid="example-status-button"
                      >
                        <div className="text-left">
                          <p className="font-medium">Status Test</p>
                          <p className="text-sm text-muted-foreground">Test HTTP status codes</p>
                        </div>
                      </Button>
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
