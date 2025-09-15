import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

interface AnalyticsCardsProps {
  stats: {
    projects: number;
    components: number;
    exports: number;
  };
}

export function AnalyticsCards({ stats }: AnalyticsCardsProps) {
  const analyticsData = [
    {
      title: "Projects",
      value: stats.projects,
      icon: "fas fa-project-diagram",
      iconColor: "text-primary",
      bgColor: "bg-primary/10",
      change: "+12%",
      changeColor: "text-accent",
    },
    {
      title: "Components",
      value: stats.components,
      icon: "fas fa-layer-group",
      iconColor: "text-accent",
      bgColor: "bg-accent/10",
      change: "+8%",
      changeColor: "text-accent",
    },
    {
      title: "Exports",
      value: `${(stats.exports / 1000).toFixed(1)}k`,
      icon: "fas fa-download",
      iconColor: "text-yellow-600",
      bgColor: "bg-yellow-500/10",
      change: "+23%",
      changeColor: "text-accent",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {analyticsData.map((item) => (
        <Card key={item.title} data-testid={`analytics-card-${item.title.toLowerCase()}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{item.title}</p>
                <p className="text-2xl font-bold" data-testid={`stat-${item.title.toLowerCase()}`}>
                  {item.value}
                </p>
              </div>
              <div className={`w-12 h-12 ${item.bgColor} rounded-lg flex items-center justify-center`}>
                <i className={`${item.icon} ${item.iconColor}`}></i>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className={`${item.changeColor} text-sm font-medium`}>
                {item.change}
              </span>
              <span className="text-xs text-muted-foreground ml-2">
                from last month
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
