import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const campaignId = parseInt(await params.id, 10);

  if (isNaN(campaignId)) {
    return NextResponse.json({ error: 'Invalid campaign ID' }, { status: 400 });
  }

  try {
    const campaignData = await prisma.campaigns.findUnique({
      where: { id: campaignId },
      include: {
        npcs: true,
        locations: true,
        notes: true,
        encounters: true,
      },
    });

    if (!campaignData) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // We only need the entities, not the campaign wrapper itself for this endpoint's purpose
    const { locations, notes, encounters } = campaignData;

    // Transform npcs to include locationName (camelCase) if location_name (snake_case) exists
    const transformedNpcs = campaignData.npcs.map(npc => ({
      ...npc,
      locationName: npc.location_name, // Map from snake_case to camelCase
    }));

    return NextResponse.json({ npcs: transformedNpcs, locations, notes, encounters });
  } catch (error) {
    console.error('Failed to fetch campaign data for flowchart:', error);
    return NextResponse.json({ error: 'Failed to fetch campaign data for flowchart' }, { status: 500 });
  }
} 