import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const campaign_id = formData.get("campaign_id");
  const date = formData.get("date");
  const time = formData.get("time");
  const location = formData.get("location") || null;
  const notes = formData.get("notes") || null;

  if (!campaign_id || !date || !time) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Combine date and time into a single DateTime string
  const dateTimeString = `${date}T${time}`;
  const dateTime = new Date(dateTimeString);

  try {
    const session = await prisma.sessions.create({
      data: {
        campaign_id: Number(campaign_id),
        date: dateTime,
        location: location as string | null,
        notes: notes as string | null,
      },
      include: {
        campaigns: true,
      },
    });
    return NextResponse.json(session);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}

export async function GET() {
  // Return all sessions with campaign title
  const sessions = await prisma.sessions.findMany({
    include: {
      campaigns: true,
    },
    orderBy: { date: "desc" },
  });
  // Map to include campaign title for frontend
  const mapped = sessions.map((s: any) => ({
    id: s.id,
    campaign: s.campaigns?.title || "",
    date: s.date,
    location: s.location,
    notes: s.notes,
    players: [], // Placeholder for future
  }));
  return NextResponse.json(mapped);
} 