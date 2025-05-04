import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const campaign_id = formData.get("campaign_id");
  const name = formData.get("name");
  const type = formData.get("type") || null;
  const description = formData.get("description") || null;

  if (!campaign_id || !name) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const npc = await prisma.npcs.create({
      data: {
        campaign_id: Number(campaign_id),
        name: name as string,
        type: type as string | null,
        description: description as string | null,
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
    return NextResponse.json({ error: "Failed to create NPC" }, { status: 500 });
  }
}

export async function GET() {
  const npcs = await prisma.npcs.findMany({
    include: {
      campaigns: true,
    },
    orderBy: { id: "desc" },
  });
  const mapped = npcs.map((n: any) => ({
    id: n.id,
    name: n.name,
    type: n.type,
    description: n.description,
    campaign: n.campaigns?.title || "",
  }));
  return NextResponse.json(mapped);
} 