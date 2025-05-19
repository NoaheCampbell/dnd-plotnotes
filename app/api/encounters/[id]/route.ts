import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id)
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid encounter ID" }, { status: 400 })
  }

  const formData = await req.formData()
  const campaign_id = formData.get("campaign_id") as string | null
  const title = formData.get("title") as string | null
  const difficulty = formData.get("difficulty") as string | null
  const campaign_location_id = formData.get("campaign_location_id") as string | null
  const creatures = formData.get("creatures") as string | null
  const npc_ids_str = formData.get("npc_ids") as string | null

  if (formData.has("title") && !title) {
    return NextResponse.json({ error: "Title cannot be empty if provided" }, { status: 400 })
  }
  if (formData.has("campaign_id") && !campaign_id) {
    return NextResponse.json({ error: "Campaign ID cannot be empty if provided" }, { status: 400 })
  }

  try {
    const updateData: any = {}

    if (campaign_id) updateData.campaign_id = Number(campaign_id)
    if (title) updateData.title = title
    if (formData.has("difficulty")) updateData.difficulty = difficulty || null
    if (formData.has("creatures")) updateData.creatures = creatures ? Number(creatures) : null
    
    if (formData.has("campaign_location_id")) {
      updateData.location_id = campaign_location_id ? Number(campaign_location_id) : null
    }

    if (formData.has("npc_ids")) {
      const npcIdsToSet = npc_ids_str
        ? npc_ids_str.split(',').map(npcId => ({ id: Number(npcId.trim()) })).filter(obj => !isNaN(obj.id))
        : []
      updateData.npcs = {
        set: npcIdsToSet
      }
    }

    const encounter = await prisma.encounters.update({
      where: { id },
      data: updateData,
      include: {
        campaigns: { select: { title: true } },
        location: { select: { name: true } },
        npcs: { select: { id: true } },
      },
    })

    return NextResponse.json({
      id: encounter.id,
      title: encounter.title,
      difficulty: encounter.difficulty,
      location_id: encounter.location_id,
      location: encounter.location?.name,
      creatures: encounter.creatures,
      campaign: encounter.campaigns?.title || "",
      npc_ids: encounter.npcs.map((npc: {id: number}) => npc.id),
    })
  } catch (error: any) {
    console.error("Error updating encounter:", error)
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Encounter not found to update" }, { status: 404 })
    }
    return NextResponse.json({ error: "Failed to update encounter" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid encounter ID" }, { status: 400 });
    }

    await prisma.encounters.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Encounter deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting encounter:", error);
    if (error.code === 'P2025') { // Prisma error code for record not found
      return NextResponse.json({ error: "Encounter not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete encounter" }, { status: 500 });
  }
} 