import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const campaign_id = formData.get("campaign_id");
  const title = formData.get("title");
  const content = formData.get("content") as string | null;
  const entity_links_json_string = formData.get("entity_links_json_string") as string | null;

  let parsedEntityLinks: Array<{ linked_entity_id: number; linked_entity_type: string }> = [];
  if (entity_links_json_string) {
    try {
      parsedEntityLinks = JSON.parse(entity_links_json_string);
      if (!Array.isArray(parsedEntityLinks)) {
        parsedEntityLinks = [];
      }
    } catch (error) {
      console.error("Failed to parse entity_links_json_string:", error);
      // Decide if you want to return an error or proceed without links
      // For now, proceeding without links if parsing fails
      parsedEntityLinks = [];
    }
  }

  if (!campaign_id || !title) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const note = await prisma.notes.create({
      data: {
        campaign_id: Number(campaign_id),
        title: title as string,
        content: content,
        ...(parsedEntityLinks.length > 0 && {
          entity_links: {
            create: parsedEntityLinks.map(link => ({
              linked_entity_id: link.linked_entity_id,
              linked_entity_type: link.linked_entity_type,
              // assignedAt and updatedAt should have defaults or auto-update in schema
            })),
          },
        }),
      },
      include: {
        campaigns: true,
        entity_links: true, // Include the created links
      },
    });
    return NextResponse.json({
      ...note,
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
        entity_links: true, // Good to include here as well if lists of notes need their links
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