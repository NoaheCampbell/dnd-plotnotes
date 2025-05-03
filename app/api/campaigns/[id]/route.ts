import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id)
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 })

  const data = await req.json()

  try {
    const updated = await prisma.campaigns.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update campaign" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id)
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 })

  const data = await req.json()

  try {
    const updated = await prisma.campaigns.update({
      where: { id },
      data: {
        active: data.active,
      },
    })
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update campaign" }, { status: 500 })
  }
}