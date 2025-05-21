import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function uploadImageToCloudinary(
  file: File
): Promise<string | undefined> {
  if (!file || typeof file !== "object" || !("size" in file) || file.size === 0) {
    return undefined;
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise<{
      secure_url: string;
      [key: string]: any;
    }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ resource_type: "image" }, (err, result) => {
          if (err || !result) {
            console.error("Cloudinary upload error:", err);
            return reject(err || new Error("Cloudinary upload failed."));
          }
          resolve(result as { secure_url: string; [key: string]: any });
        })
        .end(buffer);
    });

    return uploadResult.secure_url;
  } catch (error) {
    console.error("Error in uploadImageToCloudinary:", error);
    // Depending on desired error handling, you might re-throw, return undefined, or a specific error object.
    return undefined;
  }
} 