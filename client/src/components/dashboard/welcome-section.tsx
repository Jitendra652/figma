import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function WelcomeSection() {
  const { user } = useAuth();

  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-primary to-accent rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2" data-testid="welcome-message">
              Welcome back, {user?.firstName || user?.username}! 👋
            </h2>
            <p className="text-white/90 mb-4">
              You have 3 active projects and 12 components ready to export.
            </p>
            <Button
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              data-testid="start-new-project-button"
            >
              Start New Project
            </Button>
          </div>
          {/* Illustration placeholder */}
          <div className="hidden lg:block w-32 h-32 bg-white/10 rounded-lg flex items-center justify-center">
            <i className="fas fa-rocket text-white text-3xl"></i>
          </div>
        </div>
      </div>
    </div>
  );
}
