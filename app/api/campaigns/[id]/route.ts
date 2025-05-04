import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

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

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Try to parse JSON for toggling active
    let isJson = false;
    let data: any = {};
    try {
      data = await req.json();
      isJson = true;
    } catch {
      // Not JSON, will use formData below
    }
    if (isJson && typeof data.active !== "undefined") {
      const campaign = await prisma.campaigns.update({
        where: { id: Number(params.id) },
        data: { active: data.active },
      });
      return NextResponse.json(campaign);
    }
    // Fallback to formData for other updates
    const formData = await req.formData()
    const title = formData.get("title") as string
    const description = formData.get("description") as string | null
    const imageFile = formData.get("image")

    // Get the old image_url
    const oldCampaign = await prisma.campaigns.findUnique({ where: { id: Number(params.id) }, select: { image_url: true } })
    const oldImageUrl = oldCampaign?.image_url

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

    const campaign = await prisma.campaigns.update({
      where: { id: Number(params.id) },
      data: {
        title,
        description,
        ...(image_url && { image_url }),
        ...(image_public_id && { image_public_id }),
      },
    })

    // Delete the old image from Cloudinary if a new one was uploaded
    if (image_url && oldImageUrl) {
      // Extract the public_id from the old image_url
      const publicId = oldImageUrl.split('/').pop()?.split('.')[0]
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId)
        } catch (error) {
          console.error("Error deleting old image from Cloudinary:", error)
        }
      }
    }

    return NextResponse.json(campaign)
  } catch (error) {
    console.error("Error updating campaign:", error)
    return NextResponse.json(
      { error: "Failed to update campaign" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 })

    // Get the campaign to check for image
    const campaign = await prisma.campaigns.findUnique({
      where: { id },
      select: { image_url: true }
    })

    // If there's an image, delete it from Cloudinary
    if (campaign?.image_url) {
      // Extract the public_id from the URL
      const publicId = campaign.image_url.split('/').pop()?.split('.')[0]
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId)
        } catch (error) {
          console.error("Error deleting image from Cloudinary:", error)
          // Continue with deletion even if image deletion fails
        }
      }
    }

    // First, delete all related data
    await prisma.$transaction([
      prisma.notes.deleteMany({ where: { campaign_id: id } }),
      prisma.sessions.deleteMany({ where: { campaign_id: id } }),
      prisma.npcs.deleteMany({ where: { campaign_id: id } }),
      prisma.items.deleteMany({ where: { campaign_id: id } }),
      prisma.locations.deleteMany({ where: { campaign_id: id } }),
      prisma.encounters.deleteMany({ where: { campaign_id: id } }),
      // Finally, delete the campaign
      prisma.campaigns.delete({ where: { id } })
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting campaign:", error)
    return NextResponse.json({ error: "Failed to delete campaign" }, { status: 500 })
  }
}