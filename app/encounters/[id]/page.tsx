import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import GenericEntityEditModal from "@/components/generic-entity-edit-modal"

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

  const config = {
    api: "/api/encounters",
    label: "Encounter",
    fields: [
      {
        name: "campaign_id",
        label: "Campaign",
        type: "select",
        required: true,
        options: campaigns.map(c => ({ value: c.id, label: c.title }))
      },
      {
        name: "title",
        label: "Title",
        type: "text",
        required: true
      },
      {
        name: "difficulty",
        label: "Difficulty",
        type: "text"
      },
      {
        name: "location",
        label: "Location",
        type: "text"
      },
      {
        name: "creatures",
        label: "Number of Creatures",
        type: "text"
      }
    ]
  }

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
        <div className="mt-4">
          <GenericEntityEditModal
            open={false}
            setOpen={() => {}}
            config={config}
            entity={encounter}
            onEdited={() => window.location.reload()}
          />
        </div>
      </Card>
    </div>
  )
} 