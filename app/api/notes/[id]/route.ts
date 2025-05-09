import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id)
  const formData = await req.formData()
  const campaign_id = formData.get("campaign_id") as string | null
  const title = formData.get("title") as string | null
  const content = formData.get("content") as string | null

  if (!campaign_id || !title) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    const note = await prisma.notes.update({
      where: { id },
      data: {
        campaign_id: Number(campaign_id),
        title,
        content: content || null,
      },
      include: {
        campaigns: true,
      },
    })
    return NextResponse.json({
      id: note.id,
      title: note.title,
      content: note.content,
      created_at: note.created_at,
      campaign: note.campaigns?.title || "",
    })
  } catch (error) {
    console.error("Error updating note:", error)
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 })
  }
} 