import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const campaign_id = formData.get("campaign_id");
  const title = formData.get("title");
  const content = formData.get("content") || null;

  if (!campaign_id || !title) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const note = await prisma.notes.create({
      data: {
        campaign_id: Number(campaign_id),
        title: title as string,
        content: content as string | null,
      },
      include: {
        campaigns: true,
      },
    });
    return NextResponse.json({
      id: note.id,
      title: note.title,
      content: note.content,
      created_at: note.created_at,
      campaign: note.campaigns?.title || "",
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
    const mapped = notes.map((n: any) => ({
      id: n.id,
      title: n.title,
      content: n.content,
      created_at: n.created_at,
      campaign: n.campaigns?.title || "",
    }));
    return NextResponse.json(mapped);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json([], { status: 500 });
  }
} 