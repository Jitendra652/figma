import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/ui/theme-provider";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [showAIHelper, setShowAIHelper] = useState(false);
  const { user, logoutMutation } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const [profile, setProfile] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    username: user?.username || "",
  });

  const [preferences, setPreferences] = useState({
    notifications: true,
    emailUpdates: false,
    darkMode: theme === 'dark',
    autoSave: true,
    showHints: true,
  });

  const [apiSettings, setApiSettings] = useState({
    figmaApiKey: "",
    webhookUrl: "",
    maxFileSize: "10",
    allowedFileTypes: "image/*,application/pdf",
  });

  const handleProfileSave = () => {
    // In a real app, this would make an API call to update the user profile
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully",
    });
  };

  const handlePreferencesSave = () => {
    if (preferences.darkMode !== (theme === 'dark')) {
      setTheme(preferences.darkMode ? 'dark' : 'light');
    }
    
    toast({
      title: "Preferences saved",
      description: "Your preferences have been saved",
    });
  };

  const handleApiSettingsSave = () => {
    toast({
      title: "API settings saved",
      description: "Your API settings have been updated",
    });
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleDeleteAccount = () => {
    // In a real app, this would show a confirmation dialog and delete the account
    toast({
      title: "Account deletion",
      description: "This feature is not implemented yet",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Settings" onAIHelperToggle={() => setShowAIHelper(!showAIHelper)} />

        <div className="flex-1 overflow-auto">
          <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">Settings</h1>
              <p className="text-muted-foreground">Manage your account and application preferences</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile" data-testid="profile-tab">Profile</TabsTrigger>
                <TabsTrigger value="preferences" data-testid="preferences-tab">Preferences</TabsTrigger>
                <TabsTrigger value="api" data-testid="api-tab">API</TabsTrigger>
                <TabsTrigger value="account" data-testid="account-tab">Account</TabsTrigger>
              </TabsList>

              {/* Profile Settings */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center space-x-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">
                          {(profile.firstName?.[0] || profile.username?.[0] || 'U').toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          {profile.firstName && profile.lastName 
                            ? `${profile.firstName} ${profile.lastName}`
                            : profile.username}
                        </h3>
                        <p className="text-muted-foreground">{profile.email}</p>
                        <Badge variant="outline" className="mt-2">{user?.role}</Badge>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={profile.firstName}
                          onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                          data-testid="first-name-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={profile.lastName}
                          onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                          data-testid="last-name-input"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                        data-testid="email-input"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={profile.username}
                        onChange={(e) => setProfile({...profile, username: e.target.value})}
                        data-testid="username-input"
                      />
                    </div>

                    <Button onClick={handleProfileSave} data-testid="save-profile-button">
                      <i className="fas fa-save mr-2"></i>
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Preferences */}
              <TabsContent value="preferences">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Appearance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Dark Mode</Label>
                          <p className="text-sm text-muted-foreground">Use dark theme</p>
                        </div>
                        <Switch
                          checked={preferences.darkMode}
                          onCheckedChange={(checked) => setPreferences({...preferences, darkMode: checked})}
                          data-testid="dark-mode-toggle"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Notifications</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Browser Notifications</Label>
                          <p className="text-sm text-muted-foreground">Show desktop notifications</p>
                        </div>
                        <Switch
                          checked={preferences.notifications}
                          onCheckedChange={(checked) => setPreferences({...preferences, notifications: checked})}
                          data-testid="notifications-toggle"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Email Updates</Label>
                          <p className="text-sm text-muted-foreground">Receive email notifications</p>
                        </div>
                        <Switch
                          checked={preferences.emailUpdates}
                          onCheckedChange={(checked) => setPreferences({...preferences, emailUpdates: checked})}
                          data-testid="email-updates-toggle"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Editor</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Auto Save</Label>
                          <p className="text-sm text-muted-foreground">Automatically save changes</p>
                        </div>
                        <Switch
                          checked={preferences.autoSave}
                          onCheckedChange={(checked) => setPreferences({...preferences, autoSave: checked})}
                          data-testid="auto-save-toggle"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Show Hints</Label>
                          <p className="text-sm text-muted-foreground">Display helpful tips and hints</p>
                        </div>
                        <Switch
                          checked={preferences.showHints}
                          onCheckedChange={(checked) => setPreferences({...preferences, showHints: checked})}
                          data-testid="show-hints-toggle"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Button onClick={handlePreferencesSave} data-testid="save-preferences-button">
                    <i className="fas fa-save mr-2"></i>
                    Save Preferences
                  </Button>
                </div>
              </TabsContent>

              {/* API Settings */}
              <TabsContent value="api">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Figma Integration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="figmaApiKey">Figma API Key</Label>
                        <Input
                          id="figmaApiKey"
                          type="password"
                          value={apiSettings.figmaApiKey}
                          onChange={(e) => setApiSettings({...apiSettings, figmaApiKey: e.target.value})}
                          placeholder="Enter your Figma API key"
                          data-testid="figma-api-key-input"
                        />
                        <p className="text-sm text-muted-foreground">
                          Get your API key from{" "}
                          <a 
                            href="https://www.figma.com/developers/api#access-tokens" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Figma Developer Settings
                          </a>
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Webhooks</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="webhookUrl">Webhook URL</Label>
                        <Input
                          id="webhookUrl"
                          type="url"
                          value={apiSettings.webhookUrl}
                          onChange={(e) => setApiSettings({...apiSettings, webhookUrl: e.target.value})}
                          placeholder="https://your-app.com/webhook"
                          data-testid="webhook-url-input"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>File Upload</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                          <Select 
                            value={apiSettings.maxFileSize} 
                            onValueChange={(value) => setApiSettings({...apiSettings, maxFileSize: value})}
                          >
                            <SelectTrigger data-testid="max-file-size-select">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">5 MB</SelectItem>
                              <SelectItem value="10">10 MB</SelectItem>
                              <SelectItem value="25">25 MB</SelectItem>
                              <SelectItem value="50">50 MB</SelectItem>
                              <SelectItem value="100">100 MB</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
                          <Input
                            id="allowedFileTypes"
                            value={apiSettings.allowedFileTypes}
                            onChange={(e) => setApiSettings({...apiSettings, allowedFileTypes: e.target.value})}
                            placeholder="image/*,application/pdf"
                            data-testid="allowed-file-types-input"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Button onClick={handleApiSettingsSave} data-testid="save-api-settings-button">
                    <i className="fas fa-save mr-2"></i>
                    Save API Settings
                  </Button>
                </div>
              </TabsContent>

              {/* Account Settings */}
              <TabsContent value="account">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 rounded-lg">
                        <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Change Password</h4>
                        <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-1">
                          Update your password to keep your account secure
                        </p>
                        <Button variant="outline" className="mt-3" data-testid="change-password-button">
                          <i className="fas fa-key mr-2"></i>
                          Change Password
                        </Button>
                      </div>
                      
                      <div className="p-4 border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 rounded-lg">
                        <h4 className="font-medium text-blue-800 dark:text-blue-200">Export Data</h4>
                        <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                          Download a copy of your data including projects and design tokens
                        </p>
                        <Button variant="outline" className="mt-3" data-testid="export-data-button">
                          <i className="fas fa-download mr-2"></i>
                          Export Data
                        </Button>
                      </div>

                      <div className="p-4 border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-lg">
                        <h4 className="font-medium text-red-800 dark:text-red-200">Sign Out</h4>
                        <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                          Sign out of your account on this device
                        </p>
                        <Button 
                          variant="outline" 
                          className="mt-3" 
                          onClick={handleLogout}
                          disabled={logoutMutation.isPending}
                          data-testid="logout-button"
                        >
                          {logoutMutation.isPending ? (
                            <>
                              <i className="fas fa-spinner animate-spin mr-2"></i>
                              Signing out...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-sign-out-alt mr-2"></i>
                              Sign Out
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-red-600">Danger Zone</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-lg">
                        <h4 className="font-medium text-red-800 dark:text-red-200">Delete Account</h4>
                        <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                          Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                        <Button 
                          variant="destructive" 
                          className="mt-3"
                          onClick={handleDeleteAccount}
                          data-testid="delete-account-button"
                        >
                          <i className="fas fa-trash mr-2"></i>
                          Delete Account
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
