import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ProtectedRoute } from "@/lib/protected-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import FigmaImport from "@/pages/figma-import";
import FormBuilder from "@/pages/form-builder";
import ApiTester from "@/pages/api-tester";
import FileManager from "@/pages/file-manager";
import DesignTokens from "@/pages/design-tokens";
import Settings from "@/pages/settings";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/figma-import" component={FigmaImport} />
      <ProtectedRoute path="/form-builder" component={FormBuilder} />
      <ProtectedRoute path="/api-tester" component={ApiTester} />
      <ProtectedRoute path="/file-manager" component={FileManager} />
      <ProtectedRoute path="/design-tokens" component={DesignTokens} />
      <ProtectedRoute path="/settings" component={Settings} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
