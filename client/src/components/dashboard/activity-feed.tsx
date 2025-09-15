import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import type { ActivityLog } from "@shared/schema";

interface ActivityFeedProps {
  activities: ActivityLog[];
}

const getActivityIcon = (action: string) => {
  switch (action) {
    case "figma_imported":
      return { icon: "fas fa-upload", color: "text-primary", bg: "bg-primary/10" };
    case "component_created":
      return { icon: "fas fa-code", color: "text-accent", bg: "bg-accent/10" };
    case "user_logged_in":
      return { icon: "fas fa-sign-in-alt", color: "text-green-600", bg: "bg-green-500/10" };
    case "project_created":
      return { icon: "fas fa-plus", color: "text-blue-600", bg: "bg-blue-500/10" };
    default:
      return { icon: "fas fa-info-circle", color: "text-muted-foreground", bg: "bg-muted/20" };
  }
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4" data-testid="activity-feed">
          {activities.length > 0 ? (
            activities.map((activity) => {
              const { icon, color, bg } = getActivityIcon(activity.action);
              return (
                <div key={activity.id} className="flex items-start space-x-3" data-testid={`activity-item-${activity.id}`}>
                  <div className={`w-8 h-8 ${bg} rounded-full flex items-center justify-center mt-0.5`}>
                    <i className={`${icon} ${color} text-xs`}></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.details}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.createdAt!), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <i className="fas fa-history text-2xl mb-2"></i>
              <p>No recent activity</p>
            </div>
          )}
        </div>
        {activities.length > 0 && (
          <Button
            variant="ghost"
            className="w-full mt-4 text-primary hover:text-primary/80"
            data-testid="view-all-activity-button"
          >
            View all activity
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
