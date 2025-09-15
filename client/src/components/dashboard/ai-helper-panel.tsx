import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface AIHelperPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

export function AIHelperPanel({ isVisible, onClose }: AIHelperPanelProps) {
  const [prompt, setPrompt] = useState("");

  if (!isVisible) return null;

  return (
    <aside className="w-80 bg-card border-l border-border flex flex-col" data-testid="ai-helper-panel">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-primary to-accent rounded flex items-center justify-center">
              <i className="fas fa-magic text-white text-xs"></i>
            </div>
            <h3 className="font-semibold">AI Helper</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            data-testid="ai-helper-close-button"
          >
            <i className="fas fa-times"></i>
          </Button>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Smart Suggestion */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-0.5">
                <i className="fas fa-lightbulb text-white text-xs"></i>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-1">Smart Suggestion</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Based on your dashboard layout, consider adding a data visualization component.
                </p>
                <Button
                  size="sm"
                  className="text-xs bg-primary text-primary-foreground px-3 py-1 h-auto hover:bg-primary/90"
                  data-testid="generate-chart-button"
                >
                  Generate Chart
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Quick Actions</h4>
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start p-3 h-auto"
              data-testid="ai-generate-component"
            >
              <div className="flex items-center space-x-2">
                <i className="fas fa-code text-primary text-sm"></i>
                <span className="text-sm">Generate component code</span>
              </div>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start p-3 h-auto"
              data-testid="ai-suggest-colors"
            >
              <div className="flex items-center space-x-2">
                <i className="fas fa-palette text-accent text-sm"></i>
                <span className="text-sm">Suggest color palette</span>
              </div>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start p-3 h-auto"
              data-testid="ai-optimize-mobile"
            >
              <div className="flex items-center space-x-2">
                <i className="fas fa-mobile-alt text-yellow-600 text-sm"></i>
                <span className="text-sm">Optimize for mobile</span>
              </div>
            </Button>
          </div>
        </div>

        {/* Content Generator */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Content Generator</h4>
          <Textarea
            placeholder="Describe what you need..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="resize-none h-24"
            data-testid="ai-content-input"
          />
          <Button
            className="w-full"
            disabled={!prompt.trim()}
            data-testid="ai-generate-content-button"
          >
            Generate Content
          </Button>
        </div>
      </div>
    </aside>
  );
}
