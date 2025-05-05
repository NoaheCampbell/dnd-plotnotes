import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import GenericEntityDetailsClient from "@/components/GenericEntityDetailsClient"
import { entitiesConfig } from "@/lib/entities-config"

interface ItemPageProps {
  params: {
    id: string
  }
}

export default async function ItemDetailsPage({ params }: ItemPageProps) {
  const awaitedParams = await params;
  const item = await prisma.items.findUnique({
    where: { id: Number(awaitedParams.id) },
  })
  if (!item) return notFound()
  return <GenericEntityDetailsClient entity={item} config={entitiesConfig.items} apiPath="/items" />
} 