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

type ResizeConfig = {
  width: number;
  height: number;
  fit: "cover" | "inside";
};

type FullSizeConfig = {
  preserveOriginalSize: true;
};

type SizeConfig = ResizeConfig | FullSizeConfig;

// Now define SIZES with proper typing
const SIZES: Record<string, SizeConfig> = {
  thumb: { width: 200, height: 200, fit: "cover" as const },
  sm: { width: 400, height: 400, fit: "inside" as const },
  md: { width: 800, height: 800, fit: "inside" as const },
  lg: { width: 1600, height: 1600, fit: "inside" as const },
  display: { width: 2400, height: 2400, fit: "inside" as const },
  full: { preserveOriginalSize: true },
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
      const photoId = key.split("/").pop()?.split(".")[0];
      if (!photoId) {
        throw new Error(`Could not extract photoId from key: ${key}`);
      }

      const baseImage = sharp(imageBuffer);
      const extension = getExtension(ContentType);
      const metadata = await baseImage.metadata();
      const rotatedImage = baseImage.rotate();

      const resizePromises = [];
      const urls: Record<string, string> = {
        original: key.slice(7),
      };

      // Track full size info for later use
      let fullSizeInfo: { width?: number; height?: number } = {};

      // Process ALL sizes in parallel (including full)
      for (const [size, dimensions] of Object.entries(SIZES)) {
        const newKey = `photos/${size}/${photoId}.${extension}`;
        urls[size] = `${size}/${photoId}.${extension}`;

        // Handle full size differently but still in parallel
        if ("preserveOriginalSize" in dimensions) {
          const fullSizePromise = rotatedImage
            .jpeg({ quality: 100, progressive: true })
            .toBuffer({ resolveWithObject: true })
            .then((result) => {
              // Save the full size info for aspect ratio calculation later
              fullSizeInfo = result.info;
              return s3Client.send(
                new PutObjectCommand({
                  Bucket: Resource.Storage.name,
                  Key: newKey,
                  Body: result.data,
                  ContentType: ContentType,
                  CacheControl: "public, max-age=31536000",
                }),
              );
            })
            .then(() => console.log(`Processed ${size}: ${newKey}`));

          resizePromises.push(fullSizePromise);
          continue;
        }

        const quality = size === "display" ? 90 : 80;
        const imageProcessor = rotatedImage.resize({
          width: dimensions.width,
          height: dimensions.height,
          fit: dimensions.fit,
          withoutEnlargement: true,
        });

        const resizePromise = imageProcessor
          .jpeg({ quality, progressive: true })
          .toBuffer({ resolveWithObject: true })
          .then((result) =>
            s3Client.send(
              new PutObjectCommand({
                Bucket: Resource.Storage.name,
                Key: newKey,
                Body: result.data,
                ContentType: ContentType,
                CacheControl: "public, max-age=31536000",
              }),
            ),
          )
          .then(() => console.log(`Processed ${size}: ${newKey}`));

        resizePromises.push(resizePromise);
      }

      await Promise.all(resizePromises);

      // Calculate aspect ratio from the full-size image
      const aspectRatio =
        fullSizeInfo.width && fullSizeInfo.height
          ? fullSizeInfo.width / fullSizeInfo.height
          : 1;

      // Update metadata with dimensions from full-size image
      await Upload.updatePhotoMetadata(photoId, urls, metadata, {
        width: fullSizeInfo.width ?? metadata.width ?? 0,
        height: fullSizeInfo.height ?? metadata.height ?? 0,
        aspectRatio,
      });

      console.log(`Successfully processed ${photoId}`);
    }
  } catch (error) {
    console.error("Error processing photo:", error);
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
