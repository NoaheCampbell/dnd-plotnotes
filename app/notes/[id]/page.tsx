import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import GenericEntityDetailsClient from "@/components/GenericEntityDetailsClient"
import { entitiesConfig } from "@/lib/entities-config"

interface NotePageProps {
  params: {
    id: string
  }
}

export default async function NoteDetailsPage({ params }: NotePageProps) {
  const awaitedParams = await params;
  const note = await prisma.notes.findUnique({
    where: { id: Number(awaitedParams.id) },
  })
  if (!note) return notFound()
  return <GenericEntityDetailsClient entity={note} config={entitiesConfig.notes} apiPath="/notes" />
} 