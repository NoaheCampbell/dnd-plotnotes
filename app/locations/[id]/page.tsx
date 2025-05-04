import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import GenericEntityEditModal from "@/components/generic-entity-edit-modal"

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

  const campaigns = await prisma.campaigns.findMany({
    where: { active: true },
    select: {
      id: true,
      title: true,
    },
  })

  const config = {
    api: "/api/locations",
    label: "Location",
    fields: [
      {
        name: "campaign_id",
        label: "Campaign",
        type: "select",
        required: true,
        options: campaigns.map(c => ({ value: c.id, label: c.title }))
      },
      {
        name: "name",
        label: "Name",
        type: "text",
        required: true
      },
      {
        name: "type",
        label: "Type",
        type: "text"
      },
      {
        name: "description",
        label: "Description",
        type: "textarea"
      },
      {
        name: "map_url",
        label: "Map URL",
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
                {location.name}
              </CardTitle>
              <CardDescription className="text-amber-800 dark:text-amber-400">
                {location.type}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-amber-900 dark:text-amber-200">
          {location.map_url && (
            <div className="mb-4">
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
          <div className="mb-4">
            <h3 className="font-semibold">Description</h3>
            <p>{location.description || "No description available"}</p>
          </div>
        </CardContent>
        <div className="mt-4">
          <GenericEntityEditModal
            open={false}
            setOpen={() => {}}
            config={config}
            entity={location}
            onEdited={() => window.location.reload()}
          />
        </div>
      </Card>
    </div>
  )
} 