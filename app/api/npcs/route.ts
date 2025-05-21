import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { uploadImageToCloudinary } from "@/lib/cloudinary-utils";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const race = formData.get("race") as string | null;
    const class_ = formData.get("class") as string | null;
    const alignment = formData.get("alignment") as string | null;
    const age = formData.get("age") as string | null;
    const hair_color = formData.get("hair_color") as string | null;
    const eye_color = formData.get("eye_color") as string | null;
    const skin_color = formData.get("skin_color") as string | null;
    const height = formData.get("height") as string | null;
    const weight = formData.get("weight") as string | null;
    const personality_traits = formData.get("personality_traits") as string | null;
    const ideals = formData.get("ideals") as string | null;
    const bonds = formData.get("bonds") as string | null;
    const flaws = formData.get("flaws") as string | null;
    const backstory = formData.get("backstory") as string | null;
    const campaign_id = formData.get("campaign_id") as string | null;
    const location_name = formData.get("location_name") as string | null;
    const imageFile = formData.get("image") as File | null;

    let image_url: string | undefined = undefined;
    if (imageFile) {
      image_url = await uploadImageToCloudinary(imageFile);
    }

    const npc = await prisma.npcs.create({
      data: {
        name,
        race,
        class: class_,
        alignment,
        age,
        hair_color,
        eye_color,
        skin_color,
        height,
        weight,
        personality_traits,
        ideals,
        bonds,
        flaws,
        backstory,
        location_name,
        campaigns: campaign_id ? { connect: { id: Number(campaign_id) } } : undefined,
        image_url,
      },
    });

    return NextResponse.json(npc);
  } catch (error) {
    console.error("Error creating NPC:", error);
    return NextResponse.json(
      { error: "Failed to create NPC" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const npcs = await prisma.npcs.findMany({
    include: {
      campaigns: true,
    },
    orderBy: { id: "desc" },
  });
  return NextResponse.json(npcs);
} 