import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface EncounterPageProps {
  params: {
    id: string
  }
}

export default async function EncounterDetailsPage({ params }: EncounterPageProps) {
  const encounter = await prisma.encounters.findUnique({
    where: { id: Number(params.id) },
    include: { campaigns: true },
  })
  if (!encounter) return notFound()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <Card className="max-w-lg w-full border-amber-800/30 bg-parchment-light dark:bg-stone-800 dark:border-amber-800/20">
        <CardHeader>
          <CardTitle className="text-amber-900 dark:text-amber-200 font-heading text-2xl">
            {encounter.title}
          </CardTitle>
          <CardDescription className="text-amber-800 dark:text-amber-400">
            Campaign: {encounter.campaigns?.title || "Unknown"}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-amber-900 dark:text-amber-200 space-y-2">
          <p><strong>Difficulty:</strong> {encounter.difficulty || "Unknown"}</p>
          <p><strong>Location:</strong> {encounter.location || "Unknown"}</p>
          <p><strong>Creatures:</strong> {encounter.creatures ?? "N/A"}</p>
        </CardContent>
      </Card>
    </div>
  )
} 