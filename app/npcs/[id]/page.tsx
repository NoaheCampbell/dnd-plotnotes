import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EditNpcModal } from "@/components/npc-edit-modal"

interface NpcPageProps {
  params: {
    id: string
  }
}

export default async function NpcDetailsPage({ params }: NpcPageProps) {
  const npc = await prisma.npcs.findUnique({
    where: { id: Number(params.id) },
    include: { campaigns: true },
  })
  if (!npc) return notFound()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <Card className="max-w-lg w-full border-amber-800/30 bg-parchment-light dark:bg-stone-800 dark:border-amber-800/20">
        <CardHeader>
          <CardTitle className="text-amber-900 dark:text-amber-200 font-heading text-2xl">
            {npc.name}
          </CardTitle>
          <CardDescription className="text-amber-800 dark:text-amber-400">
            Campaign: {npc.campaigns?.title || "Unknown"}
          </CardDescription>
          {(npc as any).image_url && (
            <div className="mt-4">
              <img 
                src={(npc as any).image_url} 
                alt={npc.name} 
                className="w-full max-w-md mx-auto h-64 object-cover rounded border border-amber-800/30"
              />
            </div>
          )}
        </CardHeader>
        <CardContent className="text-amber-900 dark:text-amber-200 space-y-2">
          <p><strong>Type:</strong> {npc.type || "Type not specified"}</p>
          <p><strong>Description:</strong> {npc.description || "No description available"}</p>
        </CardContent>
        <EditNpcModal npc={npc} />
      </Card>
    </div>
  )
} 