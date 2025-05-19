import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const campaign_id = formData.get("campaign_id");
  const title = formData.get("title");
  const difficulty = formData.get("difficulty") || null;
  const campaign_location_id = formData.get("campaign_location_id") || null;
  const creatures = formData.get("creatures") || null;
  const npc_ids_str = formData.get("npc_ids") as string | null;

  if (!campaign_id || !title) {
    return NextResponse.json({ error: "Missing required fields: campaign_id, title" }, { status: 400 });
  }

  const npcIdsToConnect = npc_ids_str
    ? npc_ids_str.split(',').map(id => ({ id: Number(id.trim()) })).filter(obj => !isNaN(obj.id))
    : [];

  try {
    const encounterData: { 
      campaign_id: number;
      title: string;
      difficulty?: string | null;
      creatures?: number | null;
      location_id?: number | null;
      npcs?: { connect: Array<{id: number}> };
    } = {
      campaign_id: Number(campaign_id),
      title: title as string,
    };

    if (difficulty) encounterData.difficulty = difficulty as string;
    if (creatures) encounterData.creatures = Number(creatures);
    if (campaign_location_id) {
      encounterData.location_id = Number(campaign_location_id);
    }
    if (npcIdsToConnect.length > 0) {
      encounterData.npcs = {
        connect: npcIdsToConnect,
      };
    }

    const encounter = await prisma.encounters.create({
      data: encounterData,
      include: {
        campaigns: { select: { title: true } },
        location: { select: { name: true } },
        npcs: { select: { id: true } },
      },
    });

    return NextResponse.json({
      id: encounter.id,
      title: encounter.title,
      difficulty: encounter.difficulty,
      location_id: encounter.location_id,
      location: encounter.location?.name,
      creatures: encounter.creatures,
      campaign: encounter.campaigns?.title || "",
      npc_ids: encounter.npcs.map((npc) => npc.id),
    });
  } catch (error) {
    console.error("Error creating encounter:", error);
    return NextResponse.json({ error: "Failed to create encounter" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const encounters = await prisma.encounters.findMany({
      include: {
        campaigns: true,
      },
      orderBy: { id: "desc" },
    });
    const mapped = encounters.map((e: any) => ({
      id: e.id,
      title: e.title,
      difficulty: e.difficulty,
      location: e.location,
      creatures: e.creatures,
      campaign: e.campaigns?.title || "",
    }));
    return NextResponse.json(mapped);
  } catch (error) {
    console.error("Error fetching encounters:", error);
    return NextResponse.json([], { status: 500 });
  }
} 