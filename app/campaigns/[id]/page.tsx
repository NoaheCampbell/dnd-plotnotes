import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import CampaignDetailsClient from "@/components/CampaignDetailsClient"
import { entitiesConfig } from "@/lib/entities-config"

interface CampaignPageProps {
  params: {
    id: string
  }
}

export default async function CampaignDetailsPage({ params }: CampaignPageProps) {
  const awaitedParams = await params;
  const campaign = await prisma.campaigns.findUnique({
    where: { id: Number(awaitedParams.id) },
    include: {
      npcs: true,
      locations: true,
      items: true,
      notes: true,
      sessions: true,
      encounters: true,
    },
  })
  if (!campaign) return notFound()
  const allCampaigns = await prisma.campaigns.findMany({ select: { id: true, title: true } });
  return (
    <CampaignDetailsClient
      campaign={campaign}
      npcs={campaign.npcs}
      locations={campaign.locations}
      items={campaign.items}
      notes={campaign.notes}
      sessions={campaign.sessions}
      encounters={campaign.encounters}
      campaigns={allCampaigns}
    />
  )
}