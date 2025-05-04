import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id)
  const data = await req.json()
  const { campaign_id, title, difficulty, location, creatures } = data

  if (!campaign_id || !title) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    const encounter = await prisma.encounters.update({
      where: { id },
      data: {
        campaign_id: Number(campaign_id),
        title,
        difficulty: difficulty || null,
        location: location || null,
        creatures: creatures ? Number(creatures) : null,
      },
      include: {
        campaigns: true,
      },
    })
    return NextResponse.json({
      id: encounter.id,
      title: encounter.title,
      difficulty: encounter.difficulty,
      location: encounter.location,
      creatures: encounter.creatures,
      campaign: encounter.campaigns?.title || "",
    })
  } catch (error) {
    console.error("Error updating encounter:", error)
    return NextResponse.json({ error: "Failed to update encounter" }, { status: 500 })
  }
} 