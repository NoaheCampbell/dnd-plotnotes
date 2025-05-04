import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

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
  const imageFile = formData.get("image")

  let image_url: string | undefined = undefined
  if (
    imageFile &&
    typeof imageFile === "object" &&
    "size" in imageFile &&
    (imageFile as File).size > 0
  ) {
    const arrayBuffer = await (imageFile as File).arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream({ resource_type: "image" }, (err, result) => {
        if (err || !result) return reject(err)
        resolve(result as any)
      }).end(buffer)
    })
    image_url = uploadResult.secure_url
  }

  const item = await prisma.items.create({
    data: {
      name,
      type,
      rarity,
      campaign,
      image_url,
    },
  })

  return NextResponse.json(item)
} 