import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface LocationPageProps {
  params: {
    id: string
  }
}

export default async function LocationDetailsPage({ params }: LocationPageProps) {
  const location = await prisma.locations.findUnique({
    where: { id: Number(params.id) },
  })
  if (!location) return notFound()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <Card className="max-w-2xl w-full border-amber-800/30 bg-parchment-light dark:bg-stone-800 dark:border-amber-800/20">
        {location.map_url && (
          <div className="w-full flex flex-col items-center mb-4">
            <img
              src={location.map_url}
              alt={location.name}
              className="w-full h-auto rounded border border-amber-800/30"
            />
            <a
              href={location.map_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-sm text-amber-900 dark:text-amber-200 underline hover:text-red-900 dark:hover:text-amber-400"
            >
              View Full Size
            </a>
          </div>
        )}
        <CardHeader>
          <CardTitle className="text-amber-900 dark:text-amber-200 font-heading text-2xl">
            {location.name}
          </CardTitle>
          <CardDescription className="text-amber-800 dark:text-amber-400">
            {location.type}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-amber-900 dark:text-amber-200">
          <p>{location.description}</p>
        </CardContent>
      </Card>
    </div>
  )
} 