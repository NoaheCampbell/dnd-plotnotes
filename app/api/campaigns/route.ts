import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: Request) {
  const formData = await req.formData();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const imageFile = formData.get("image") as File | null;

  let image_url: string | undefined = undefined;

  if (imageFile && typeof imageFile === "object") {
    // Convert the image to a buffer
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream({ resource_type: "image" }, (err, result) => {
        if (err || !result) return reject(err);
        resolve(result as any);
      }).end(buffer);
    });

    image_url = uploadResult.secure_url;
  }

  const campaign = await prisma.campaigns.create({
    data: {
      title,
      description,
      image_url,
    },
  });

  return NextResponse.json(campaign);
}

export async function GET() {
    const campaigns = await prisma.campaigns.findMany({
      orderBy: { last_played: "desc" },
    })
    return NextResponse.json(campaigns)
  }