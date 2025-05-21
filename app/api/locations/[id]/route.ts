import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { uploadImageToCloudinary } from "@/lib/cloudinary-utils"

export async function PATCH(
  req: Request,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  try {
    const params = await paramsPromise
    const formData = await req.formData()
    
    const dataToUpdate: { [key: string]: any } = {}

    const name = formData.get("name") as string | null
    if (name) dataToUpdate.name = name

    const type = formData.get("type") as string | null
    if (type) dataToUpdate.type = type
    else if (formData.has("type") && !type) dataToUpdate.type = null

    const description = formData.get("description") as string | null
    if (description) dataToUpdate.description = description
    else if (formData.has("description") && !description) dataToUpdate.description = null

    // const campaign_id_str = formData.get("campaign_id") as string | null
    // if (campaign_id_str) dataToUpdate.campaign_id = Number(campaign_id_str) // Do not allow campaign_id to be updated

    const next_location_id_str = formData.get("next_location_id") as string | null
    if (next_location_id_str === "null" || next_location_id_str === "") {
      dataToUpdate.next_location_id = null
    } else if (next_location_id_str) {
      dataToUpdate.next_location_id = parseInt(next_location_id_str, 10)
    }

    const mapFile = formData.get("map") as File | null
    if (mapFile && mapFile.size > 0) {
      const map_url = await uploadImageToCloudinary(mapFile)
      if (map_url) {
        dataToUpdate.map_url = map_url
      }
    } else if (formData.get("map_url") === "null" || formData.get("map_url") === "") {
      dataToUpdate.map_url = null
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ error: "No fields to update provided" }, { status: 400 })
    }

    const updatedLocation = await prisma.locations.update({
      where: { id: Number(params.id) },
      data: dataToUpdate,
    })

    return NextResponse.json(updatedLocation)
  } catch (error) {
    console.error("Error updating location:", error)
    return NextResponse.json(
      { error: "Failed to update location" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise
    const id = Number(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid location ID" }, { status: 400 })
    }

    await prisma.locations.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Location deleted successfully" }, { status: 200 })
  } catch (error: any) {
    console.error("Error deleting location:", error)
    if (error.code === 'P2025') { // Prisma error code for record not found
      return NextResponse.json({ error: "Location not found" }, { status: 404 })
    }
    return NextResponse.json({ error: "Failed to delete location" }, { status: 500 })
  }
} 