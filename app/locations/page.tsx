import { prisma } from "@/lib/prisma"
import LocationsPageClient from "@/components/locations-page-client"

export default async function LocationsPage() {
  const locations = await prisma.locations.findMany()
  return <LocationsPageClient initialLocations={locations} />
}
