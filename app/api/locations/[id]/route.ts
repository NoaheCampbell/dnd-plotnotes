import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await req.formData()
    const name = formData.get("name") as string
    const type = formData.get("type") as string | null
    const description = formData.get("description") as string | null
    const campaign_id = formData.get("campaign_id") as string | null
    const mapFile = formData.get("map")

    let map_url: string | undefined = undefined
    if (
      mapFile &&
      typeof mapFile === "object" &&
      "size" in mapFile &&
      (mapFile as File).size > 0
    ) {
      const arrayBuffer = await (mapFile as File).arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
        cloudinary.uploader.upload_stream({ resource_type: "image" }, (err, result) => {
          if (err || !result) return reject(err)
          resolve(result as any)
        }).end(buffer)
      })
      map_url = uploadResult.secure_url
    }

    const location = await prisma.locations.update({
      where: { id: Number(params.id) },
      data: {
        name,
        type,
        description,
        campaign_id: campaign_id ? Number(campaign_id) : null,
        ...(map_url && { map_url }),
      },
    })

    return NextResponse.json(location)
  } catch (error) {
    console.error("Error updating location:", error)
    return NextResponse.json(
      { error: "Failed to update location" },
      { status: 500 }
    )
  }
} 