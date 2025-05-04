"use client";

import { useSettings } from "@/app/context/settings-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();

  const handleSettingChange = async (key: string, value: any) => {
    await updateSettings({ [key]: value });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how PlotNotes looks and feels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select
              value={settings.theme}
              onValueChange={(value) => handleSettingChange("theme", value)}
            >
              <SelectTrigger>
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

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Manage your notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Session Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get reminders before your next session
              </p>
            </div>
            <Switch
              checked={settings.session_reminders}
              onCheckedChange={(checked) => handleSettingChange("session_reminders", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Campaign Updates</Label>
              <p className="text-sm text-muted-foreground">
                Receive updates about your campaigns
              </p>
            </div>
            <Switch
              checked={settings.campaign_updates}
              onCheckedChange={(checked) => handleSettingChange("campaign_updates", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>New Content</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about new features and content
              </p>
            </div>
            <Switch
              checked={settings.new_content}
              onCheckedChange={(checked) => handleSettingChange("new_content", checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Game Settings</CardTitle>
          <CardDescription>Configure your default game settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Default Players Count</Label>
            <Input
              type="number"
              value={settings.players_count}
              onChange={(e) => handleSettingChange("players_count", parseInt(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Default Session Duration (hours)</Label>
            <Input
              type="number"
              value={settings.session_duration}
              onChange={(e) => handleSettingChange("session_duration", parseInt(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Default Location</Label>
            <Input
              value={settings.default_location}
              onChange={(e) => handleSettingChange("default_location", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backup Settings</CardTitle>
          <CardDescription>Configure your backup preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto Backup</Label>
              <p className="text-sm text-muted-foreground">
                Automatically backup your campaign data
              </p>
            </div>
            <Switch
              checked={settings.auto_backup}
              onCheckedChange={(checked) => handleSettingChange("auto_backup", checked)}
            />
          </div>
          <div className="space-y-2">
            <Label>Backup Frequency</Label>
            <Select
              value={settings.backup_frequency}
              onValueChange={(value) => handleSettingChange("backup_frequency", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}