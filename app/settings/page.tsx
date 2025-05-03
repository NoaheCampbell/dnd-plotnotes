"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Download, Upload, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [backupEnabled, setBackupEnabled] = useState(true);

  const handleExport = () => {
    // Placeholder for export logic
    alert("Exported data!");
  };

  const handleImport = () => {
    // Placeholder for import logic
    alert("Import started!");
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all data?")) {
      alert("Data cleared.");
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight text-amber-900 dark:text-amber-200">Settings</h1>
            <p className="text-amber-800 dark:text-amber-400 italic">Customize your PlotNotes experience</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-amber-800/30 bg-parchment-light dark:bg-stone-800 dark:border-amber-800/20">
            <CardHeader>
              <CardTitle className="text-amber-900 dark:text-amber-200">Appearance</CardTitle>
              <CardDescription className="text-amber-800 dark:text-amber-400">Toggle dark mode and font settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="dark-mode" className="text-amber-900 dark:text-amber-200">Dark Mode</Label>
                <Switch id="dark-mode" checked={darkMode} onCheckedChange={setDarkMode} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-800/30 bg-parchment-light dark:bg-stone-800 dark:border-amber-800/20">
            <CardHeader>
              <CardTitle className="text-amber-900 dark:text-amber-200">Data Management</CardTitle>
              <CardDescription className="text-amber-800 dark:text-amber-400">Backup, import, and reset your campaign data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full" onClick={handleExport}>
                <Upload className="mr-2 h-4 w-4" /> Export Data
              </Button>
              <Button variant="outline" className="w-full" onClick={handleImport}>
                <Download className="mr-2 h-4 w-4" /> Import Data
              </Button>
              <Button variant="destructive" className="w-full" onClick={handleReset}>
                <Trash2 className="mr-2 h-4 w-4" /> Reset All Data
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}