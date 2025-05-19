import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id)
  const formData = await req.formData()
  const campaign_id = formData.get("campaign_id") as string | null
  const title = formData.get("title") as string | null
  const content = formData.get("content") as string | null
  const linked_entity_type = formData.get("linked_entity_type") as string | null;
  const linked_entity_id_str = formData.get("linked_entity_id") as string | null;
  const linked_entity_name = formData.get("linked_entity_name") as string | null;

  const linked_entity_id = linked_entity_id_str ? parseInt(linked_entity_id_str, 10) : null;

  // Basic validation, can be expanded
  if (!title) { // campaign_id might be optional if a note isn't campaign-specific
    return NextResponse.json({ error: "Title is a required field" }, { status: 400 })
  }

  try {
    const dataToUpdate: any = {
      title,
      content: content || null,
      linked_entity_type: linked_entity_type,
      linked_entity_id: linked_entity_id,
      linked_entity_name: linked_entity_name,
    };

    if (campaign_id) {
      dataToUpdate.campaign_id = Number(campaign_id);
    }

    const note = await prisma.notes.update({
      where: { id },
      data: dataToUpdate,
      include: {
        campaigns: true,
      },
    })
    return NextResponse.json({
      ...note,
      campaign: note.campaigns?.title || "",
    })
  } catch (error) {
    console.error("Error updating note:", error)
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
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