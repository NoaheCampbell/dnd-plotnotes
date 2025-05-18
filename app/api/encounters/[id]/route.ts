import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id)
  const formData = await req.formData()
  const campaign_id = formData.get("campaign_id") as string | null
  const title = formData.get("title") as string | null
  const difficulty = formData.get("difficulty") as string | null
  const location = formData.get("location") as string | null
  const creatures = formData.get("creatures") as string | null

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