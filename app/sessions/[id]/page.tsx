import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import EntityActions from "@/components/EntityActions"
import { entitiesConfig } from "@/lib/entities-config"

interface SessionPageProps {
  params: {
    id: string
  }
}

export default async function SessionDetailsPage({ params }: SessionPageProps) {
  const session = await prisma.sessions.findUnique({
    where: { id: Number(params.id) },
    include: { campaigns: true },
  })
  if (!session) return notFound()

  // Extract date and time
  const dateObj = session.date ? new Date(session.date) : null
  const dateStr = dateObj ? dateObj.toLocaleDateString() : "Unknown date"
  const timeStr = dateObj ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Unknown time"

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <Card className="max-w-lg w-full border-amber-800/30 bg-parchment-light dark:bg-stone-800 dark:border-amber-800/20">
        <CardHeader>
          <CardTitle className="text-amber-900 dark:text-amber-200 font-heading text-2xl">
            {session.campaigns?.title || "Unknown Campaign"}
          </CardTitle>
          <CardDescription className="text-amber-800 dark:text-amber-400">
            {dateStr} @ {timeStr}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-amber-900 dark:text-amber-200 space-y-2">
          <p><strong>Location:</strong> {session.location || "Unknown"}</p>
          <p><strong>Notes:</strong> {session.notes || "No notes available"}</p>
        </CardContent>
        <EntityActions entity={session} config={entitiesConfig.sessions} apiPath="/sessions" />
      </Card>
    </div>
  )
} 