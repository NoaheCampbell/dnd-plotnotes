import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { uploadImageToCloudinary } from "@/lib/cloudinary-utils"

export async function POST(req: Request) {
  const formData = await req.formData()
  const name = formData.get("name") as string
  const type = formData.get("type") as string | null
  const description = formData.get("description") as string | null
  const mapFile = formData.get("map") as File | null
  const campaign_id = formData.get("campaign_id") as string | null
  const next_location_id_str = formData.get("next_location_id") as string | null

  let map_url: string | undefined = undefined
  const next_location_id = next_location_id_str ? parseInt(next_location_id_str, 10) : null

  if (mapFile) {
    map_url = await uploadImageToCloudinary(mapFile)
  }

  const location = await prisma.locations.create({
    data: {
      name,
      type,
      description,
      map_url,
      campaign_id: campaign_id ? Number(campaign_id) : null,
      next_location_id: next_location_id,
    },
  })

  return NextResponse.json(location)
}

export async function GET() {
  const locations = await prisma.locations.findMany();
  return NextResponse.json(locations);
} 