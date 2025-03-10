import {
  BatchGetCommand,
  BatchWriteCommand,
  GetCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { Resource } from "sst";
import { z } from "zod";
import { ddb } from "../lib/ddb";
import { s3 } from "../lib/s3";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

export namespace Photo {
  const photoMetadataSchema = z.object({
    channels: z.number(),
    format: z.string(),
    hasAlpha: z.boolean(),
    hasProfile: z.boolean(),
    height: z.number(),
    orientation: z.number(),
    space: z.string(),
    width: z.number(),
  });

  const photoUrlsSchema = z.object({
    display: z.string(),
    lg: z.string(),
    md: z.string(),
    original: z.string(),
    sm: z.string(),
    thumb: z.string(),
    full: z.string(),
  });
  type PhotoUrls = z.infer<typeof photoUrlsSchema>;

  const schema = z.object({
    pk: z.literal("PHOTOS"),
    sk: z.string().startsWith("PHOTO#"),
    gsi1pk: z.literal("PHOTO"),
    gsi1sk: z.string().datetime(),
    photoId: z.string(),
    originalFilename: z.string(),
    size: z.number(),
    contentType: z.string(),
    photoStatus: z.union([z.literal("complete"), z.literal("uploading")]),
    s3Key: z.string(),
    createdAt: z.string().datetime(),
    // TODO: make deletions happen on ttl
    deletedAt: z.string().datetime().optional(),
    expireAt: z.number().optional(),
    metadata: photoMetadataSchema.optional(),
    aspectRatio: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    urls: photoUrlsSchema.optional(),
  });

  export const schemaWithoutId = schema.omit({
    pk: true,
    sk: true,
    gsi1pk: true,
    gsi1sk: true,
  });

  export type PhotoData = z.infer<typeof schemaWithoutId>;

  export const get = async (id: string) => {
    const command = new GetCommand({
      TableName: Resource.Table.name,
      Key: {
        pk: "PHOTOS",
        sk: `PHOTO#${id}`,
      },
    });

    const res = await ddb.send(command);

    return res.Item as PhotoData | undefined;
  };

  export const list = async () => {
    const command = new QueryCommand({
      TableName: Resource.Table.name,
      KeyConditionExpression: "pk = :pk AND begins_with(sk, :skPrefix)",
      FilterExpression: "photoStatus = :photoStatus",
      ExpressionAttributeValues: {
        ":pk": "PHOTOS",
        ":skPrefix": "PHOTO#",
        ":photoStatus": "complete",
      },
    });

    const res = await ddb.send(command);

    return res.Items as PhotoData[];
  };

  /**
   * Remove photo
   * Remove from ddb and then s3 from a stream
   */
  export const remove = async (photoIds: string[]) => {
    // remove photos from ddb
    const command = new BatchWriteCommand({
      RequestItems: {
        [Resource.Table.name]: photoIds.map((id) => ({
          DeleteRequest: {
            Key: {
              pk: "PHOTOS",
              sk: `PHOTO#${id}`,
            },
          },
        })),
      },
    });

    const res = await ddb.send(command);

    if (res.UnprocessedItems && Object.keys(res.UnprocessedItems).length > 0) {
      // extract the unprocessed ids for retry
      const unprocessedIds = (res.UnprocessedItems?.[Resource.Table.name] || [])
        .map((item) => item.DeleteRequest?.Key?.sk?.replace("PHOTO#", ""))
        .filter(Boolean);

      if (unprocessedIds.length > 0) {
        console.warn(
          `retrying deletion for ${unprocessedIds.length} unprocessed items`,
        );
        // simple backoff
        await new Promise((resolve) => setTimeout(resolve, 100));
        await remove(unprocessedIds);
      }
    }

    return photoIds;
  };

  export const removeFromBucket = async (photoUrls: PhotoUrls) => {
    const commands = [];

    for (const url of Object.values(photoUrls)) {
      const command = new DeleteObjectCommand({
        Bucket: Resource.Storage.name,
        Key: `photos/${url}`,
      });

      commands.push(command);
    }

    await Promise.all(commands.map((command) => s3.send(command)));
  };

  // Batch get photos based on id
  export const batchGet = async (photoIds: string[]) => {
    const command = new BatchGetCommand({
      RequestItems: {
        [Resource.Table.name]: {
          Keys: photoIds.map((id) => ({
            pk: "PHOTOS",
            sk: `PHOTO#${id}`,
          })),
        },
      },
    });

    const res = await ddb.send(command);

    return res.Responses?.[Resource.Table.name] as PhotoData[] | undefined;
  };
}
