import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

interface ItemPageProps {
  params: { id: string }
}

export default async function ItemDetailsPage({ params }: ItemPageProps) {
  const item = await prisma.items.findUnique({
    where: { id: Number(params.id) },
  })
  if (!item) return notFound()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <Card className="max-w-lg w-full border-amber-800/30 bg-parchment-light dark:bg-stone-800 dark:border-amber-800/20">
        <CardHeader>
          <CardTitle className="text-amber-900 dark:text-amber-200 font-heading text-2xl">
            {item.name}
          </CardTitle>
          <CardDescription className="text-amber-800 dark:text-amber-400">
            {item.type} • {item.rarity}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-amber-900 dark:text-amber-200">
          <p><strong>Appears in:</strong> {item.campaign}</p>
        </CardContent>
      </Card>
    </div>
  )
} 