import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EncounterEditModal } from "@/components/encounter-edit-modal"

interface EncounterPageProps {
  params: {
    id: string
  }
}

export default async function EncounterDetailsPage({ params }: EncounterPageProps) {
  const encounter = await prisma.encounters.findUnique({
    where: { id: Number(params.id) },
  })
  if (!encounter) return notFound()

  const campaigns = await prisma.campaigns.findMany({
    where: { active: true },
    select: {
      id: true,
      title: true,
    },
  })

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <Card className="max-w-2xl w-full border-amber-800/30 bg-parchment-light dark:bg-stone-800 dark:border-amber-800/20">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-amber-900 dark:text-amber-200 font-heading text-2xl">
                {encounter.title}
              </CardTitle>
              <CardDescription className="text-amber-800 dark:text-amber-400">
                {encounter.difficulty}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-amber-900 dark:text-amber-200 space-y-4">
          {encounter.location && (
            <div>
              <h3 className="font-semibold">Location</h3>
              <p>{encounter.location}</p>
            </div>
          )}
          {encounter.creatures && (
            <div>
              <h3 className="font-semibold">Number of Creatures</h3>
              <p>{encounter.creatures}</p>
            </div>
          )}
        </CardContent>
        <EncounterEditModal encounter={encounter} campaigns={campaigns} />
      </Card>
    </div>
  )
} 