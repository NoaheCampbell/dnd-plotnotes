import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const awaitedParams = await params;
  const id = Number(awaitedParams.id);

  let data: any = {};
  try {
    if (req.headers.get("content-type")?.includes("application/json")) {
      data = await req.json();
    } else {
      const formData = await req.formData();
      formData.forEach((value, key) => {
        data[key] = value;
      });
    }
  } catch (e) {
    return new Response("Invalid request body", { status: 400 });
  }

  const { campaign_id, date, time, location, notes } = data;

  if (!campaign_id || !date || !time) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Combine date and time into a single DateTime string
  const dateTimeString = `${date}T${time}`;
  const dateTime = new Date(dateTimeString);

  try {
    const session = await prisma.sessions.update({
      where: { id },
      data: {
        campaign_id: Number(campaign_id),
        date: dateTime,
        location: location || null,
        notes: notes || null,
      },
      include: {
        campaigns: true,
      },
    });
    return NextResponse.json({
      id: session.id,
      campaign: session.campaigns?.title || "",
      date: session.date,
      location: session.location,
      notes: session.notes,
    });
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
    }

    await prisma.sessions.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Session deleted successfully" }, { status: 200 }); // Or 204 No Content
  } catch (error: any) {
    console.error("Error deleting session:", error);
    if (error.code === 'P2025') { // Prisma error code for record not found
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
  }
} 