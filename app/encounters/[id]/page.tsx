import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import GenericEntityDetailsClient from "@/components/GenericEntityDetailsClient"
import { entitiesConfig } from "@/lib/entities-config"

interface EncounterPageProps {
  params: {
    id: string
  }
}

export default async function EncounterDetailsPage({ params }: EncounterPageProps) {
  const awaitedParams = await params;
  const encounterId = Number(awaitedParams.id);

  if (isNaN(encounterId)) {
    return notFound();
  }

  const encounter = await prisma.encounters.findUnique({
    where: { id: encounterId },
    include: { campaigns: true }
  });

  if (!encounter) {
    return notFound();
  }

  let campaignLocations: any[] = [];
  if (encounter.campaign_id) {
    const locationsData = await prisma.locations.findMany({
      where: { campaign_id: encounter.campaign_id },
      orderBy: { name: 'asc' }
    });
    campaignLocations = locationsData.map(loc => ({ ...loc, id: loc.id.toString() }));
  }
  
  const allCampaigns = await prisma.campaigns.findMany({ select: { id: true, title: true } });

  return (
    <GenericEntityDetailsClient 
      entity={encounter} 
      config={entitiesConfig.encounters} 
      apiPath="/encounters" 
      campaigns={allCampaigns}
      campaignLocations={campaignLocations}
    />
  );
} 