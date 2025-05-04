import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const campaign_id = formData.get("campaign_id");
  const title = formData.get("title");
  const difficulty = formData.get("difficulty") || null;
  const location = formData.get("location") || null;
  const creatures = formData.get("creatures") || null;

  if (!campaign_id || !title || !difficulty) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const encounter = await prisma.encounters.create({
      data: {
        campaign_id: Number(campaign_id),
        title: title as string,
        difficulty: difficulty as string | null,
        location: location as string | null,
        creatures: creatures ? Number(creatures) : null,
      },
      include: {
        campaigns: true,
      },
    });
    return NextResponse.json({
      id: encounter.id,
      title: encounter.title,
      difficulty: encounter.difficulty,
      location: encounter.location,
      creatures: encounter.creatures,
      campaign: encounter.campaigns?.title || "",
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