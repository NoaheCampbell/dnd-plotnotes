import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import GenericEntityDetailsClient from "@/components/GenericEntityDetailsClient"
import { entitiesConfig } from "@/lib/entities-config"

interface LocationPageProps {
  params: {
    id: string
  }
}

export default async function LocationDetailsPage({ params }: LocationPageProps) {
  const awaitedParams = await params;
  const location = await prisma.locations.findUnique({
    where: { id: Number(awaitedParams.id) },
  })
  if (!location) return notFound()

  // Fetch all locations to be available for linking
  const allLocationsForLinking = await prisma.locations.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  return <GenericEntityDetailsClient entity={location} config={entitiesConfig.locations} apiPath="/locations" allLocationsForLinking={allLocationsForLinking} />
} 