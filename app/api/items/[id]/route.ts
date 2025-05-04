import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id)
  const data = await req.json()
  const { campaign_id, name, type, rarity, image_url } = data

  if (!campaign_id || !name) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    const item = await prisma.items.update({
      where: { id },
      data: {
        campaign_id: Number(campaign_id),
        name,
        type: type || null,
        rarity: rarity || null,
        image_url: image_url || null,
      },
      include: {
        campaigns: true,
      },
    })
    return NextResponse.json({
      id: item.id,
      name: item.name,
      type: item.type,
      rarity: item.rarity,
      image_url: item.image_url,
      campaign: item.campaigns?.title || "",
    })
  } catch (error) {
    console.error("Error updating item:", error)
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 })
  }
} 