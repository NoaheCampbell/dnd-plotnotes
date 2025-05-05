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
  return <GenericEntityDetailsClient entity={npc} config={entitiesConfig.npcs} apiPath="/npcs" />
} 