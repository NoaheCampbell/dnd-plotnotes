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

  // Normalize date fields to ISO strings for all entities
  function normalizeDates(obj: any) {
    if (!obj || typeof obj !== 'object') return obj;
    const out = { ...obj };
    for (const key in out) {
      if (out[key] instanceof Date) {
        out[key] = out[key].toISOString();
      } else if (typeof out[key] === 'object' && out[key] !== null) {
        out[key] = normalizeDates(out[key]);
      }
    }
    return out;
  }

  const npcs = campaign.npcs.map(normalizeDates);
  const locations = campaign.locations.map(normalizeDates);
  const items = campaign.items.map(normalizeDates);
  const notes = campaign.notes.map(normalizeDates);
  const sessions = campaign.sessions.map(s => ({
    ...normalizeDates(s),
    id: s.id
  }));
  const encounters = campaign.encounters.map(normalizeDates);

  return (
    <CampaignDetailsClient
      campaign={normalizeDates(campaign)}
      npcs={npcs}
      locations={locations}
      items={items}
      notes={notes}
      sessions={sessions}
      encounters={encounters}
      campaigns={allCampaigns}
    />
  )
}