import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const defaultSettings = {
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

export async function GET() {
  try {
    const settings = await prisma.settings.findFirst()
    return NextResponse.json(settings || defaultSettings)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json(defaultSettings)
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const settings = await prisma.settings.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...defaultSettings, ...data },
    })
    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error saving settings:", error)
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    )
  }
} 