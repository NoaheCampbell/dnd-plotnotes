import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const campaign_id = formData.get("campaign_id");
  const title = formData.get("title");
  const content = formData.get("content") as string | null;
  const linked_entity_type = formData.get("linked_entity_type") as string | null;
  const linked_entity_id_str = formData.get("linked_entity_id") as string | null;
  const linked_entity_name = formData.get("linked_entity_name") as string | null;

  const linked_entity_id = linked_entity_id_str ? parseInt(linked_entity_id_str, 10) : null;

  if (!campaign_id || !title) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const note = await prisma.notes.create({
      data: {
        campaign_id: Number(campaign_id),
        title: title as string,
        content: content,
        linked_entity_type: linked_entity_type,
        linked_entity_id: linked_entity_id,
        linked_entity_name: linked_entity_name,
      },
      include: {
        campaigns: true,
      },
    });
    return NextResponse.json({
      ...note,
      campaign: note.campaigns?.title || "", // Keep this for now, but consider if campaigns relation is always needed
    });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const notes = await prisma.notes.findMany({
      include: {
        campaigns: true,
      },
      orderBy: { id: "desc" },
    });
    const mapped = notes.map((n) => ({
      ...n,
      campaign: n.campaigns?.title || "",
    }));
    return NextResponse.json(mapped);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json([], { status: 500 });
  }
} 