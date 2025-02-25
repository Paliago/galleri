import type { S3Handler, S3Event } from "aws-lambda";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import sharp from "sharp";
import { Resource } from "sst";
import { Upload } from "@galleri/core/upload";

const s3Client = new S3Client({});

const SIZES = {
  thumb: { width: 200, height: 200, fit: "cover" as const },
  sm: { width: 400, height: 400, fit: "inside" as const },
  md: { width: 800, height: 800, fit: "inside" as const },
  lg: { width: 1600, height: 1600, fit: "inside" as const },
  display: { width: 2400, height: 2400, fit: "inside" as const },
};

// Get file extension from content type
const getExtension = (contentType: string): string => {
  const mapping: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  return mapping[contentType] || "jpg";
};

export const handler: S3Handler = async (event: S3Event) => {
  try {
    for (const record of event.Records) {
      const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

      console.log(`Processing: ${key}`);

      const { Body, ContentType } = await s3Client.send(
        new GetObjectCommand({
          Bucket: Resource.Storage.name,
          Key: key,
        }),
      );

      if (!Body || !ContentType) {
        throw new Error(`Failed to retrieve object ${key}`);
      }

      const imageBuffer = await streamToBuffer(Body as NodeJS.ReadableStream);

      // Extract photoId from key
      // Assuming format: photos/originals/[photoId].jpg
      const photoId = key.split("/").pop()?.split(".")[0];
      if (!photoId) {
        throw new Error(`Could not extract photoId from key: ${key}`);
      }

      const extension = getExtension(ContentType);

      const metadata = await sharp(imageBuffer).metadata();

      // Generate resized versions
      const resizePromises = [];
      const urls: Record<string, string> = {
        original: key,
      };

      for (const [size, dimensions] of Object.entries(SIZES)) {
        const newKey = `photos/${size}/${photoId}.${extension}`;
        urls[size] = `${size}/${photoId}.${extension}`;

        const quality = size === "display" ? 85 : 80;

        const resizePromise = sharp(imageBuffer)
          .resize({
            width: dimensions.width,
            height: dimensions.height,
            fit: dimensions.fit,
            withoutEnlargement: true,
          })
          // Apply appropriate format options
          .jpeg({ quality, progressive: true })
          .toBuffer()
          .then((resizedBuffer) =>
            s3Client.send(
              new PutObjectCommand({
                Bucket: Resource.Storage.name,
                Key: newKey,
                Body: resizedBuffer,
                ContentType: ContentType,
                CacheControl: "public, max-age=31536000", // 1 year cache
              }),
            ),
          )
          .then(() => console.log(`Resized to ${size}: ${newKey}`));

        resizePromises.push(resizePromise);
      }

      await Promise.all(resizePromises);

      const aspectRatio =
        metadata.width && metadata.height
          ? metadata.width / metadata.height
          : 1;

      await Upload.updateMetadata(photoId, urls, aspectRatio, metadata);

      console.log(`Successfully processed ${photoId}`);
    }
  } catch (error) {
    console.error("Error processing image:", error);
    throw error;
  }
};
// Helper function to convert stream to buffer
async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
}
