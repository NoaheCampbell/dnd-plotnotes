import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const items = await prisma.items.findMany()
  return NextResponse.json(items)
}

export async function POST(req: Request) {
  const formData = await req.formData()
  const name = formData.get("name") as string
  const type = formData.get("type") as string | null
  const rarity = formData.get("rarity") as string | null
  const campaign = formData.get("campaign") as string | null

  const item = await prisma.items.create({
    data: {
      name,
      type,
      rarity,
      campaign,
    },
  })

  return NextResponse.json(item)
} 