import { Card } from "@/components/ui/card";
import { Link } from "wouter";

const quickActions = [
  {
    title: "Import Figma",
    description: "Upload design file",
    icon: "fas fa-upload",
    iconColor: "text-primary",
    bgColor: "bg-primary/10",
    href: "/figma-import",
  },
  {
    title: "Generate Code",
    description: "Export React components",
    icon: "fas fa-code",
    iconColor: "text-accent",
    bgColor: "bg-accent/10",
    href: "/components",
  },
  {
    title: "Form Builder",
    description: "Create dynamic forms",
    icon: "fas fa-wpforms",
    iconColor: "text-yellow-600",
    bgColor: "bg-yellow-500/10",
    href: "/form-builder",
  },
  {
    title: "API Tester",
    description: "Test endpoints",
    icon: "fas fa-vials",
    iconColor: "text-purple-600",
    bgColor: "bg-purple-500/10",
    href: "/api-tester",
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {quickActions.map((action) => (
        <Link key={action.title} href={action.href}>
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" data-testid={`quick-action-${action.title.toLowerCase().replace(/\s+/g, '-')}`}>
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 ${action.bgColor} rounded-lg flex items-center justify-center`}>
                <i className={`${action.icon} ${action.iconColor}`}></i>
              </div>
              <div>
                <h3 className="font-medium">{action.title}</h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
