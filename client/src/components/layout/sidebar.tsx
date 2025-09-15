import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navigation = [
  {
    title: "Workspace",
    items: [
      { name: "Dashboard", href: "/", icon: "fas fa-home" },
      { name: "Import Figma", href: "/figma-import", icon: "fas fa-upload" },
      { name: "Components", href: "/components", icon: "fas fa-layer-group" },
      { name: "Design Tokens", href: "/design-tokens", icon: "fas fa-palette" },
    ],
  },
  {
    title: "Tools",
    items: [
      { name: "Form Builder", href: "/form-builder", icon: "fas fa-wpforms" },
      { name: "API Tester", href: "/api-tester", icon: "fas fa-vials" },
      { name: "File Manager", href: "/file-manager", icon: "fas fa-cloud-upload-alt" },
      { name: "Plugins", href: "/plugins", icon: "fas fa-puzzle-piece" },
    ],
  },
  {
    title: "Management",
    items: [
      { name: "Team", href: "/team", icon: "fas fa-users" },
      { name: "Settings", href: "/settings", icon: "fas fa-cog" },
      { name: "Analytics", href: "/analytics", icon: "fas fa-chart-line" },
    ],
  },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      {/* Logo & Brand */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <i className="fas fa-layer-group text-white text-sm"></i>
          </div>
          <div>
            <h1 className="text-lg font-semibold">FigmaReact</h1>
            <p className="text-xs text-muted-foreground">Design to Code</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1" data-testid="sidebar-navigation">
        {navigation.map((section) => (
          <div key={section.title} className="mb-4">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = location === item.href;
                return (
                  <li key={item.name}>
                    <Link href={item.href}>
                      <a
                        className={cn(
                          "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                        data-testid={`nav-link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <i className={`${item.icon} w-4`}></i>
                        <span>{item.name}</span>
                      </a>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">JD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">John Doe</p>
            <p className="text-xs text-muted-foreground truncate">john@company.com</p>
          </div>
          <button className="text-muted-foreground hover:text-foreground" data-testid="user-menu-button">
            <i className="fas fa-ellipsis-v"></i>
          </button>
        </div>
      </div>
    </aside>
  );
}
