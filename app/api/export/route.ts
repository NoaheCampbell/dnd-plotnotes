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
    const data = await prisma.$transaction(async (tx) => {
      const campaigns = await tx.campaigns.findMany({
        include: {
          sessions: true,
          npcs: true,
          notes: true,
        },
      })
      const settings = await tx.settings.findFirst().catch(() => defaultSettings)
      return { campaigns, settings }
    })

    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": 'attachment; filename="grimoire-backup.json"',
      },
    })
  } catch (error) {
    console.error("Error exporting data:", error)
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    )
  }
} 