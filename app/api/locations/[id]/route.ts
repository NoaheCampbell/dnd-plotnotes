import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id)
  const data = await req.json()
  const { campaign_id, name, type, description, map_url } = data

  if (!campaign_id || !name) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    const location = await prisma.locations.update({
      where: { id },
      data: {
        campaign_id: Number(campaign_id),
        name,
        type: type || null,
        description: description || null,
        map_url: map_url || null,
      },
      include: {
        campaigns: true,
      },
    })
    return NextResponse.json({
      id: location.id,
      name: location.name,
      type: location.type,
      description: location.description,
      map_url: location.map_url,
      campaign: location.campaigns?.title || "",
    })
  } catch (error) {
    console.error("Error updating location:", error)
    return NextResponse.json({ error: "Failed to update location" }, { status: 500 })
  }
} 