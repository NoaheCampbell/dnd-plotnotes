"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useTheme } from "next-themes"

interface Settings {
  theme: string
  session_reminders: boolean
  campaign_updates: boolean
  new_content: boolean
  players_count: number
  session_duration: number
  default_location: string
  auto_backup: boolean
  backup_frequency: string
}

interface SettingsContextType {
  settings: Settings
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>
}

const defaultSettings: Settings = {
  theme: "system",
  session_reminders: true,
  campaign_updates: true,
  new_content: true,
  players_count: 4,
  session_duration: 3,
  default_location: "",
  auto_backup: true,
  backup_frequency: "daily",
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: async () => {},
})

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const { setTheme } = useTheme()

  useEffect(() => {
    // Load settings from API
    const loadSettings = async () => {
      try {
        const response = await fetch("/api/settings")
        const data = await response.json()
        setSettings(data)
        setTheme(data.theme)
      } catch (error) {
        console.error("Error loading settings:", error)
      }
    }
    loadSettings()
  }, [setTheme])

  const updateSettings = async (newSettings: Partial<Settings>) => {
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      })
      const data = await response.json()
      setSettings(data)
      if (newSettings.theme) {
        setTheme(newSettings.theme)
      }
    } catch (error) {
      console.error("Error updating settings:", error)
    }
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext) 