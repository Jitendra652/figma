import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Notification } from "@shared/schema";

interface NotificationsPanelProps {
  notifications: Notification[];
}

export function NotificationsPanel({ notifications }: NotificationsPanelProps) {
  const queryClient = useQueryClient();

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PATCH", `/api/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return { icon: "fas fa-check-circle", color: "text-green-600" };
      case "warning":
        return { icon: "fas fa-exclamation-triangle", color: "text-yellow-600" };
      case "error":
        return { icon: "fas fa-times-circle", color: "text-red-600" };
      default:
        return { icon: "fas fa-info-circle", color: "text-blue-600" };
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Notifications</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-primary hover:text-primary/80"
            data-testid="mark-all-read-button"
          >
            Mark all read
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3" data-testid="notifications-panel">
          {notifications.length > 0 ? (
            notifications.map((notification) => {
              const { icon, color } = getNotificationIcon(notification.type || 'info');
              return (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border ${
                    notification.type === 'success' ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' :
                    notification.type === 'warning' ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800' :
                    notification.type === 'error' ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' :
                    'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                  }`}
                  data-testid={`notification-${notification.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <i className={`${icon} ${color} mt-1`}></i>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-muted-foreground">{notification.message}</p>
                      </div>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <i className="fas fa-bell-slash text-2xl mb-2"></i>
              <p>No notifications</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
