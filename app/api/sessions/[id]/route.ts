import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const data = await req.json();
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