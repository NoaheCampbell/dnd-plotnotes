import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import GenericEntityDetailsClient from "@/components/GenericEntityDetailsClient"
import { entitiesConfig } from "@/lib/entities-config"

interface NpcPageProps {
  params: {
    id: string
  }
}

export default async function NpcDetailsPage({ params }: NpcPageProps) {
  const awaitedParams = await params;
  const npc = await prisma.npcs.findUnique({
    where: { id: Number(awaitedParams.id) },
    include: { campaigns: true },
  })
  if (!npc) return notFound()

  const allCampaigns = await prisma.campaigns.findMany({
    select: { id: true, title: true },
    orderBy: { title: 'asc' }
  });

  const allLocations = await prisma.locations.findMany({
    select: { id: true, name: true, campaign_id: true },
    orderBy: { name: 'asc' }
  });

  return <GenericEntityDetailsClient 
    entity={npc} 
    config={entitiesConfig.npcs} 
    apiPath="/npcs" 
    campaigns={allCampaigns} 
    campaignLocations={allLocations}
  />
} 