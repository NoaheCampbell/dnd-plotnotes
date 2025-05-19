import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import GenericEntityDetailsClient from "@/components/GenericEntityDetailsClient"
import { entitiesConfig } from "@/lib/entities-config"

interface NotePageProps {
  params: {
    id: string
  }
}

export default async function NoteDetailsPage({ params }: NotePageProps) {
  const awaitedParams = await params;
  const note = await prisma.notes.findUnique({
    where: { id: Number(awaitedParams.id) },
    include: { campaigns: true }, // Include campaign if it's linked
  })

  if (!note) return notFound();

  const allCampaigns = await prisma.campaigns.findMany({
    select: { id: true, title: true },
    orderBy: { title: 'asc' }
  });

  const allLocations = await prisma.locations.findMany({
    select: { id: true, name: true, campaign_id: true },
    orderBy: { name: 'asc' }
  });

  // Fetch all other potential linkable entities
  const allNpcs = await prisma.npcs.findMany({ select: { id: true, name: true, campaign_id: true }, orderBy: { name: 'asc' }});
  const allItems = await prisma.items.findMany({ select: { id: true, name: true, campaign_id: true }, orderBy: { name: 'asc' }});
  const allEncounters = await prisma.encounters.findMany({ select: { id: true, title: true, campaign_id: true }, orderBy: { title: 'asc' }});

  return <GenericEntityDetailsClient 
    entity={note} 
    config={entitiesConfig.notes} 
    apiPath="/notes" 
    campaigns={allCampaigns} 
    campaignLocations={allLocations}
    allNpcs={allNpcs}
    allItems={allItems}
    allEncounters={allEncounters}
  />;
} 