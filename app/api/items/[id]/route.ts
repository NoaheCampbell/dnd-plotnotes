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
    const rarity = formData.get("rarity") as string | null
    const campaign_id = formData.get("campaign_id") as string | null
    const imageFile = formData.get("image")

    // Get the old image public_id
    const oldItem = await prisma.items.findUnique({ where: { id: Number(params.id) }, select: { image_public_id: true } })
    const oldPublicId = oldItem?.image_public_id

    let image_url: string | undefined = undefined
    let image_public_id: string | undefined = undefined
    if (
      imageFile &&
      typeof imageFile === "object" &&
      "size" in imageFile &&
      (imageFile as File).size > 0
    ) {
      const arrayBuffer = await (imageFile as File).arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const uploadResult = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload_stream({ resource_type: "image" }, (err, result) => {
          if (err || !result) return reject(err)
          resolve(result)
        }).end(buffer)
      })
      image_url = uploadResult.secure_url
      image_public_id = uploadResult.public_id
    }

    const item = await prisma.items.update({
      where: { id: Number(params.id) },
      data: {
        name,
        type,
        rarity,
        campaign_id: campaign_id ? Number(campaign_id) : null,
        ...(image_url && { image_url }),
        ...(image_public_id && { image_public_id }),
      },
    })

    // Delete the old image from Cloudinary if a new one was uploaded
    if (image_public_id && oldPublicId) {
      await cloudinary.uploader.destroy(oldPublicId)
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error("Error updating item:", error)
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    )
  }
} 