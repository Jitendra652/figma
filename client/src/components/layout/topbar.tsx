import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/ui/theme-provider";
import { useState } from "react";

interface TopBarProps {
  title: string;
  onAIHelperToggle: () => void;
}

export function TopBar({ title, onAIHelperToggle }: TopBarProps) {
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-semibold" data-testid="page-title">{title}</h1>
          <span className="px-2 py-1 bg-accent/10 text-accent text-xs font-medium rounded">
            Pro
          </span>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-10"
              data-testid="search-input"
            />
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm"></i>
          </div>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            data-testid="notifications-button"
          >
            <i className="fas fa-bell"></i>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"></span>
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            data-testid="theme-toggle-button"
          >
            {theme === "dark" ? (
              <i className="fas fa-sun"></i>
            ) : (
              <i className="fas fa-moon"></i>
            )}
          </Button>

          {/* AI Helper Toggle */}
          <Button
            onClick={onAIHelperToggle}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            data-testid="ai-helper-toggle"
          >
            <i className="fas fa-magic mr-2"></i>
            AI Helper
          </Button>
        </div>
      </div>
    </header>
  );
}
