import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { ItemEditModal } from "@/components/item-edit-modal"

interface ItemPageProps {
  params: { id: string }
}

export default async function ItemDetailsPage({ params }: ItemPageProps) {
  const item = await prisma.items.findUnique({
    where: { id: Number(params.id) },
  })
  if (!item) return notFound()

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
        {item.image_url && (
          <div className="w-full flex flex-col items-center mb-4">
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-auto rounded border border-amber-800/30"
            />
            <a
              href={item.image_url}
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
            {item.name}
          </CardTitle>
          <CardDescription className="text-amber-800 dark:text-amber-400">
            {item.type}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-amber-900 dark:text-amber-200">
          {item.rarity && (
            <div className="mb-4">
              <h3 className="font-semibold">Rarity</h3>
              <p>{item.rarity}</p>
            </div>
          )}
        </CardContent>
        <ItemEditModal item={item} campaigns={campaigns} />
      </Card>
    </div>
  )
} 