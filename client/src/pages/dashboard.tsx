import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { WelcomeSection } from "@/components/dashboard/welcome-section";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { AnalyticsCards } from "@/components/dashboard/analytics-cards";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { NotificationsPanel } from "@/components/dashboard/notifications-panel";
import { AIHelperPanel } from "@/components/dashboard/ai-helper-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const [showAIHelper, setShowAIHelper] = useState(false);

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard"],
  });

  const toggleAIHelper = () => {
    setShowAIHelper(!showAIHelper);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const { stats, projects, activities, notifications } = dashboardData || {
    stats: { projects: 0, components: 0, exports: 0 },
    projects: [],
    activities: [],
    notifications: [],
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Dashboard" onAIHelperToggle={toggleAIHelper} />

        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <WelcomeSection />
            <QuickActions />

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Analytics Cards */}
              <div className="lg:col-span-2 space-y-6">
                <AnalyticsCards stats={stats} />

                {/* Chart Area */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Usage Analytics</CardTitle>
                      <div className="flex space-x-2">
                        <Button variant="default" size="sm" className="text-xs">7d</Button>
                        <Button variant="ghost" size="sm" className="text-xs">30d</Button>
                        <Button variant="ghost" size="sm" className="text-xs">90d</Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Chart Placeholder */}
                    <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <i className="fas fa-chart-line text-4xl text-muted-foreground mb-2"></i>
                        <p className="text-muted-foreground">Charts rendered with Recharts</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar Content */}
              <div className="space-y-6">
                <ActivityFeed activities={activities} />
                <NotificationsPanel notifications={notifications} />

                {/* Quick Tools */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Tools</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button
                        variant="ghost"
                        className="w-full justify-start p-3 h-auto"
                        data-testid="tool-color-extractor"
                      >
                        <div className="flex items-center space-x-3">
                          <i className="fas fa-palette text-primary"></i>
                          <span className="text-sm">Color Extractor</span>
                        </div>
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start p-3 h-auto"
                        data-testid="tool-spacing-calculator"
                      >
                        <div className="flex items-center space-x-3">
                          <i className="fas fa-ruler text-accent"></i>
                          <span className="text-sm">Spacing Calculator</span>
                        </div>
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start p-3 h-auto"
                        data-testid="tool-font-optimizer"
                      >
                        <div className="flex items-center space-x-3">
                          <i className="fas fa-font text-yellow-600"></i>
                          <span className="text-sm">Font Optimizer</span>
                        </div>
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start p-3 h-auto"
                        data-testid="tool-responsive-preview"
                      >
                        <div className="flex items-center space-x-3">
                          <i className="fas fa-mobile-alt text-purple-600"></i>
                          <span className="text-sm">Responsive Preview</span>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Recent Projects */}
            <Card className="mt-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Projects</CardTitle>
                  <Button data-testid="new-project-button">
                    New Project
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="recent-projects-grid">
                  {projects.length > 0 ? (
                    projects.map((project: any) => (
                      <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer" data-testid={`project-card-${project.id}`}>
                        <CardContent className="p-4">
                          <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg mb-4 flex items-center justify-center">
                            <i className="fas fa-desktop text-2xl text-muted-foreground"></i>
                          </div>
                          <h4 className="font-medium mb-2">{project.name}</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            {project.description || "No description"}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary">{project.framework || 'React'}</Badge>
                              <Badge variant="outline">Tailwind</Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(project.updatedAt!).toLocaleDateString()}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      <i className="fas fa-folder-open text-4xl mb-4"></i>
                      <p>No projects yet. Create your first project!</p>
                      <Button className="mt-4" data-testid="create-first-project-button">
                        Create Project
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <AIHelperPanel isVisible={showAIHelper} onClose={toggleAIHelper} />
    </div>
  );
}
