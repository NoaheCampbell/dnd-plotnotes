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
  const encounter = await prisma.encounters.findUnique({
    where: { id: Number(awaitedParams.id) },
  })
  if (!encounter) return notFound()
  return <GenericEntityDetailsClient entity={encounter} config={entitiesConfig.encounters} apiPath="/encounters" />
} 