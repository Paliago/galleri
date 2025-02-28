import { PutObjectCommand } from "@aws-sdk/client-s3";
import { Resource } from "sst/resource";
import { z } from "zod";
import { s3 } from "../lib/s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ddb } from "../lib/ddb";
import { PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import type sharp from "sharp";

export namespace Upload {
  export const schema = z.object({ contentType: z.string(), size: z.number() });
  export type UploadRequirements = z.infer<typeof schema>;

  export const signUrl = async (
    photoId: string,
    key: string,
    contentType: string,
  ) => {
    const command = new PutObjectCommand({
      Bucket: Resource.Storage.name,
      Key: key,
      ContentType: contentType,
      Metadata: {
        photoId,
        uploadDate: new Date().toISOString(),
      },
    });

    return await getSignedUrl(s3, command, { expiresIn: 3600 });
  };

  export const addInitialMetadata = async ({
    photoId,
    filename,
    size,
    contentType,
    key,
  }: {
    photoId: string;
    filename: string;
    size: number;
    contentType: string;
    key: string;
  }) => {
    await ddb.send(
      new PutCommand({
        TableName: Resource.Table.name,
        Item: {
          pk: "PHOTOS",
          sk: `PHOTO#${photoId}`,
          gsi1pk: "PHOTO",
          gsi1sk: new Date().toISOString(),
          photoId,
          originalFilename: filename,
          size,
          contentType,
          imageStatus: "uploading",
          s3Key: key,
          createdAt: new Date().toISOString(),
          expireAt: Math.floor(new Date().getTime() + 15 * 60 * 1000),
        },
      }),
    );
  };

  export const updateImageMetadata = async (
    photoId: string,
    urls: Record<string, string>,
    metadata: sharp.Metadata,
    {
      width,
      height,
      aspectRatio,
    }: { width: number; height: number; aspectRatio: number },
  ) => {
    const command = new UpdateCommand({
      TableName: Resource.Table.name,
      Key: {
        pk: "PHOTOS",
        sk: `PHOTO#${photoId}`,
      },
      UpdateExpression:
        "SET #imageStatus = :imageStatus, #metadata = :metadata, #urls = :urls, " +
        "#aspectRatio = :aspectRatio, #width = :width, #height = :height " +
        "REMOVE #expireAt",
      ExpressionAttributeNames: {
        "#imageStatus": "imageStatus",
        "#metadata": "metadata",
        "#urls": "urls",
        "#aspectRatio": "aspectRatio",
        "#width": "width",
        "#height": "height",
        "#expireAt": "expireAt",
      },
      ExpressionAttributeValues: {
        ":imageStatus": "complete",
        ":metadata": {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          orientation: metadata.orientation,
          hasAlpha: metadata.hasAlpha,
          space: metadata.space,
          hasProfile: metadata.hasProfile,
          channels: metadata.channels,
        },
        ":urls": urls,
        ":aspectRatio": aspectRatio,
        ":width": width,
        ":height": height,
      },
    });

    await ddb.send(command);
  };
}
