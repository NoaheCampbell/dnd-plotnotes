import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const formData = await req.formData()
  const name = formData.get("name") as string
  const type = formData.get("type") as string | null
  const description = formData.get("description") as string | null

  const location = await prisma.locations.create({
    data: {
      name,
      type,
      description,
    },
  })

  return NextResponse.json(location)
} 