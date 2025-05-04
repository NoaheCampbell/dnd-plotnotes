"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    theme: "system",
    notifications: {
      sessionReminders: true,
      campaignUpdates: true,
      newContent: true,
    },
    campaignDefaults: {
      playersCount: 4,
      sessionDuration: 3,
      defaultLocation: "",
    },
    data: {
      autoBackup: true,
      backupFrequency: "daily",
    },
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch("/api/settings");
        const data = await response.json();
        if (data) {
          setSettings({
            theme: data.theme,
            notifications: {
              sessionReminders: data.session_reminders,
              campaignUpdates: data.campaign_updates,
              newContent: data.new_content,
            },
            campaignDefaults: {
              playersCount: data.players_count,
              sessionDuration: data.session_duration,
              defaultLocation: data.default_location || "",
            },
            data: {
              autoBackup: data.auto_backup,
              backupFrequency: data.backup_frequency,
            },
          });
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };
    loadSettings();
  }, []);

  const saveSettings = async (newSettings: typeof settings) => {
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          theme: newSettings.theme,
          session_reminders: newSettings.notifications.sessionReminders,
          campaign_updates: newSettings.notifications.campaignUpdates,
          new_content: newSettings.notifications.newContent,
          players_count: newSettings.campaignDefaults.playersCount,
          session_duration: newSettings.campaignDefaults.sessionDuration,
          default_location: newSettings.campaignDefaults.defaultLocation,
          auto_backup: newSettings.data.autoBackup,
          backup_frequency: newSettings.data.backupFrequency,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const handleThemeChange = (value: string) => {
    const newSettings = { ...settings, theme: value };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    const newSettings = {
      ...settings,
      notifications: { ...settings.notifications, [key]: value }
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleCampaignDefaultChange = (key: string, value: string | number) => {
    const newSettings = {
      ...settings,
      campaignDefaults: { ...settings.campaignDefaults, [key]: value }
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleDataSettingChange = (key: string, value: string | boolean) => {
    const newSettings = {
      ...settings,
      data: { ...settings.data, [key]: value }
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleExport = async () => {
    try {
      const response = await fetch("/api/export");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "grimoire-backup.json";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight text-amber-900 dark:text-amber-200">
            Settings
          </h1>
          <p className="text-amber-800 dark:text-amber-400 italic">
            Customize your Grimoire experience
          </p>
        </div>

        <Tabs defaultValue="appearance" className="space-y-4">
          <TabsList className="bg-amber-50/50 dark:bg-amber-900/20 border-amber-800/30">
            <TabsTrigger value="appearance" className="text-amber-900 dark:text-amber-200">Appearance</TabsTrigger>
            <TabsTrigger value="notifications" className="text-amber-900 dark:text-amber-200">Notifications</TabsTrigger>
            <TabsTrigger value="campaigns" className="text-amber-900 dark:text-amber-200">Campaigns</TabsTrigger>
            <TabsTrigger value="data" className="text-amber-900 dark:text-amber-200">Data</TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-4">
            <Card className="bg-amber-50/50 dark:bg-amber-900/20 border-amber-800/30">
              <CardHeader>
                <CardTitle className="text-amber-900 dark:text-amber-200">Theme</CardTitle>
                <CardDescription className="text-amber-800 dark:text-amber-400">
                  Choose how Grimoire looks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label className="text-amber-900 dark:text-amber-200">Theme</Label>
                  <Select value={settings.theme} onValueChange={handleThemeChange}>
                    <SelectTrigger className="w-full bg-amber-50/50 border-amber-800/30 dark:bg-amber-900/20 dark:border-amber-800/30 text-amber-900 dark:text-amber-200">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card className="bg-amber-50/50 dark:bg-amber-900/20 border-amber-800/30">
              <CardHeader>
                <CardTitle className="text-amber-900 dark:text-amber-200">Notifications</CardTitle>
                <CardDescription className="text-amber-800 dark:text-amber-400">
                  Control when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-amber-900 dark:text-amber-200">Session Reminders</Label>
                  <Switch
                    checked={settings.notifications.sessionReminders}
                    onCheckedChange={(checked) => handleNotificationChange("sessionReminders", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-amber-900 dark:text-amber-200">Campaign Updates</Label>
                  <Switch
                    checked={settings.notifications.campaignUpdates}
                    onCheckedChange={(checked) => handleNotificationChange("campaignUpdates", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-amber-900 dark:text-amber-200">New Content</Label>
                  <Switch
                    checked={settings.notifications.newContent}
                    onCheckedChange={(checked) => handleNotificationChange("newContent", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-4">
            <Card className="bg-amber-50/50 dark:bg-amber-900/20 border-amber-800/30">
              <CardHeader>
                <CardTitle className="text-amber-900 dark:text-amber-200">Campaign Defaults</CardTitle>
                <CardDescription className="text-amber-800 dark:text-amber-400">
                  Set default values for new campaigns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-amber-900 dark:text-amber-200">Default Players Count</Label>
                  <Select
                    value={settings.campaignDefaults.playersCount.toString()}
                    onValueChange={(value) => handleCampaignDefaultChange("playersCount", parseInt(value))}
                  >
                    <SelectTrigger className="w-full bg-amber-50/50 border-amber-800/30 dark:bg-amber-900/20 dark:border-amber-800/30 text-amber-900 dark:text-amber-200">
                      <SelectValue placeholder="Select players count" />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 3, 4, 5, 6, 7, 8].map((count) => (
                        <SelectItem key={count} value={count.toString()}>
                          {count} players
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-amber-900 dark:text-amber-200">Default Session Duration (hours)</Label>
                  <Select
                    value={settings.campaignDefaults.sessionDuration.toString()}
                    onValueChange={(value) => handleCampaignDefaultChange("sessionDuration", parseInt(value))}
                  >
                    <SelectTrigger className="w-full bg-amber-50/50 border-amber-800/30 dark:bg-amber-900/20 dark:border-amber-800/30 text-amber-900 dark:text-amber-200">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 3, 4, 5, 6].map((hours) => (
                        <SelectItem key={hours} value={hours.toString()}>
                          {hours} hours
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <Card className="bg-amber-50/50 dark:bg-amber-900/20 border-amber-800/30">
              <CardHeader>
                <CardTitle className="text-amber-900 dark:text-amber-200">Data Management</CardTitle>
                <CardDescription className="text-amber-800 dark:text-amber-400">
                  Control your data and backups
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-amber-900 dark:text-amber-200">Automatic Backups</Label>
                  <Switch
                    checked={settings.data.autoBackup}
                    onCheckedChange={(checked) => handleDataSettingChange("autoBackup", checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-amber-900 dark:text-amber-200">Backup Frequency</Label>
                  <Select
                    value={settings.data.backupFrequency}
                    onValueChange={(value) => handleDataSettingChange("backupFrequency", value)}
                  >
                    <SelectTrigger className="w-full bg-amber-50/50 border-amber-800/30 dark:bg-amber-900/20 dark:border-amber-800/30 text-amber-900 dark:text-amber-200">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="pt-4">
                  <Button 
                    className="w-full bg-red-900 hover:bg-red-800 text-amber-100"
                    onClick={handleExport}
                  >
                    Export All Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}