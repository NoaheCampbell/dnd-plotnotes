import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const type = formData.get("type") as string | null;
    const description = formData.get("description") as string | null;
    const campaign_id = formData.get("campaign_id") as string | null;
    const imageFile = formData.get("image");

    let image_url: string | undefined = undefined;
    if (
      imageFile &&
      typeof imageFile === "object" &&
      "size" in imageFile &&
      (imageFile as File).size > 0
    ) {
      const arrayBuffer = await (imageFile as File).arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
        cloudinary.uploader.upload_stream({ resource_type: "image" }, (err, result) => {
          if (err || !result) return reject(err);
          resolve(result as any);
        }).end(buffer);
      });
      image_url = uploadResult.secure_url;
    }

    const npc = await prisma.npcs.update({
      where: { id: Number(params.id) },
      data: {
        name,
        type,
        description,
        campaigns: campaign_id ? { connect: { id: Number(campaign_id) } } : undefined,
        ...(image_url && { image_url }),
      },
    });

    return NextResponse.json(npc);
  } catch (error) {
    console.error("Error updating NPC:", error);
    return NextResponse.json({ error: "Failed to update NPC" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.npcs.delete({
      where: { id: Number(params.id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting NPC:", error);
    return NextResponse.json({ error: "Failed to delete NPC" }, { status: 500 });
  }
} 