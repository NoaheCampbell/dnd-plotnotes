import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import GenericEntityEditModal from "@/components/generic-entity-edit-modal"
import { format } from "date-fns"

interface NotePageProps {
  params: {
    id: string
  }
}

export default async function NoteDetailsPage({ params }: NotePageProps) {
  const note = await prisma.notes.findUnique({
    where: { id: Number(params.id) },
  })
  if (!note) return notFound()

  const campaigns = await prisma.campaigns.findMany({
    where: { active: true },
    select: {
      id: true,
      title: true,
    },
  })

  const config = {
    api: "/api/notes",
    label: "Note",
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
        name: "content",
        label: "Content",
        type: "textarea",
        required: true
      }
    ]
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <Card className="max-w-2xl w-full border-amber-800/30 bg-parchment-light dark:bg-stone-800 dark:border-amber-800/20">
        <CardHeader>
          <CardTitle className="text-amber-900 dark:text-amber-200 font-heading text-2xl">
            {note.title}
          </CardTitle>
          <CardDescription className="text-amber-800 dark:text-amber-400">
            {note.created_at && format(note.created_at, "MMMM d, yyyy")}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-amber-900 dark:text-amber-200">
          <div className="prose dark:prose-invert max-w-none">
            {note.content}
          </div>
        </CardContent>
        <div className="mt-4">
          <GenericEntityEditModal
            open={false}
            setOpen={() => {}}
            config={config}
            entity={note}
            onEdited={() => window.location.reload()}
          />
        </div>
      </Card>
    </div>
  )
} 