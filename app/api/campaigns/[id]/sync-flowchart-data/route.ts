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
        encounters: {
          include: {
            npcs: { select: { id: true } },
            location: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!campaignData) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const transformedNpcs = campaignData.npcs.map((npc: any) => ({
      ...npc,
      locationName: npc.location_name,
    }));

    const transformedNotes = campaignData.notes.map((note: any) => ({
      ...note,
      linkedEntityType: note.linked_entity_type,
      linkedEntityId: note.linked_entity_id,
    }));

    const transformedEncounters = campaignData.encounters.map((encounter: any) => {
      // Log raw encounter data from Prisma for debugging location linking
      console.log(
        `API Sync: Encounter ID: ${encounter.id}, Title: ${encounter.title}, ` +
        `DB campaign_location_id: ${encounter.campaign_location_id}, ` +
        `DB location object: ${JSON.stringify(encounter.location)}`
      );

      return {
        id: encounter.id,
        title: encounter.title,
        difficulty: encounter.difficulty,
        creatures: encounter.creatures,
        location_id: encounter.campaign_location_id,
        location: encounter.location ? encounter.location.name : undefined,
        npcs: encounter.npcs,
      };
    });

    return NextResponse.json({ 
      npcs: transformedNpcs, 
      locations: campaignData.locations,
      notes: transformedNotes, 
      encounters: transformedEncounters
    });
  } catch (error) {
    console.error('Failed to fetch campaign data for flowchart:', error);
    return NextResponse.json({ error: 'Failed to fetch campaign data for flowchart' }, { status: 500 });
  }
} 