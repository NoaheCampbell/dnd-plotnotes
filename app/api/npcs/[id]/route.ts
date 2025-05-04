import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const data = await req.json();
  const { campaign_id, name, type, description } = data;

  if (!campaign_id || !name) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const npc = await prisma.npcs.update({
      where: { id },
      data: {
        campaign_id: Number(campaign_id),
        name,
        type: type || null,
        description: description || null,
      },
      include: {
        campaigns: true,
      },
    });
    return NextResponse.json({
      id: npc.id,
      name: npc.name,
      type: npc.type,
      description: npc.description,
      campaign: npc.campaigns?.title || "",
    });
  } catch (error) {
    console.error("Error updating NPC:", error);
    return NextResponse.json({ error: "Failed to update NPC" }, { status: 500 });
  }
} 