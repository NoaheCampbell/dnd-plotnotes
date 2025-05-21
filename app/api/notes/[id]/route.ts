import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(req: Request, { params: routeParams }: { params: { id: string } }) {
  const params = await routeParams; // Await the params
  const id = Number(params.id)
  const formData = await req.formData()
  const campaign_id = formData.get("campaign_id") as string | null
  const title = formData.get("title") as string | null
  const content = formData.get("content") as string | null
  const entity_links_json_string = formData.get("entity_links_json_string") as string | null;

  let entity_links_to_create: Array<{ linked_entity_id: number; linked_entity_type: string }> = [];
  if (entity_links_json_string) {
    try {
      const parsedLinks = JSON.parse(entity_links_json_string);
      if (Array.isArray(parsedLinks) && parsedLinks.every(
        link => typeof link.linked_entity_id === 'number' && typeof link.linked_entity_type === 'string'
      )) {
        entity_links_to_create = parsedLinks;
      } else {
        throw new Error('Invalid entity_links format');
      }
    } catch (e) {
      console.error("Failed to parse entity_links_json_string:", e);
      // Optionally return a 400 error if links are malformed and critical
      // return NextResponse.json({ error: "Invalid format for entity_links" }, { status: 400 });
    }
  }

  // Basic validation, can be expanded
  if (!title) { // campaign_id might be optional if a note isn't campaign-specific
    return NextResponse.json({ error: "Title is a required field" }, { status: 400 })
  }

  try {
    const dataToUpdate: any = {
      title,
      content: content || null,
    };

    if (campaign_id) {
      dataToUpdate.campaign_id = Number(campaign_id);
    }

    // Transaction to update note and its links
    const note = await prisma.$transaction(async (tx) => {
      // 1. Update basic note fields
      const updatedNoteCore = await tx.notes.update({
        where: { id },
        data: dataToUpdate,
      });

      // 2. Delete existing links for this note
      await tx.entityNoteLink.deleteMany({
        where: { note_id: id },
      });

      // 3. Create new links if any are provided
      if (entity_links_to_create.length > 0) {
        await tx.entityNoteLink.createMany({
          data: entity_links_to_create.map(link => ({
            note_id: id,
            linked_entity_id: link.linked_entity_id,
            linked_entity_type: link.linked_entity_type,
          })),
        });
      }
      
      // 4. Fetch the note again with its newly created links
      return tx.notes.findUnique({
        where: { id },
        include: {
          campaigns: true, // Keep if you need campaign info
          entity_links: true, // Include the new links
        },
      });
    });

    if (!note) { // Should not happen if update was successful
        return NextResponse.json({ error: "Failed to retrieve updated note" }, { status: 500 });
    }

    return NextResponse.json({
      ...note,
      campaign: note.campaigns?.title || "", // Keep this transformation if needed
    });
  } catch (error) {
    console.error("Error updating note:", error)
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params: routeParams }: { params: { id: string } }) {
  const params = await routeParams; // Await the params
  try {
    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid note ID" }, { status: 400 });
    }

    await prisma.notes.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Note deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting note:", error);
    if (error.code === 'P2025') { // Prisma error code for record not found
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
} 