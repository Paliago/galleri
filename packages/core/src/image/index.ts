import { z } from "zod";
import { ddb } from "../lib/ddb";
import { GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { Resource } from "sst";

export namespace Image {
  const photoMetadataSchema = z.object({
    channels: z.number(),
    format: z.string(),
    hasAlpha: z.boolean(),
    hasProfile: z.boolean(),
    height: z.number(),
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
  });

  const schema = z.object({
    pk: z.literal("PHOTOS"),
    sk: z.string().startsWith("PHOTO#"),
    gsi1pk: z.literal("PHOTO"),
    gsi1sk: z.string().datetime(),
    photoId: z.string(),
    originalFilename: z.string(),
    size: z.number(),
    contentType: z.string(),
    status: z.literal("complete"),
    s3Key: z.string(),
    createdAt: z.string().datetime(),
    metadata: photoMetadataSchema.optional(),
    aspectRatio: z.number().optional(),
    urls: photoUrlsSchema.optional(),
  });

  export const schemaWithoutId = schema.omit({
    pk: true,
    sk: true,
    gsi1pk: true,
    gsi1sk: true,
  });

  export type ImageData = z.infer<typeof schemaWithoutId>;

  export const get = async (id: string) => {
    const command = new GetCommand({
      TableName: Resource.Table.name,
      Key: {
        pk: "PHOTOS",
        sk: `PHOTO#${id}`,
      },
    });

    const res = await ddb.send(command);

    return res.Item as ImageData | undefined;
  };

  export const list = async () => {
    const command = new QueryCommand({
      TableName: Resource.Table.name,
      KeyConditionExpression: "pk = :pk AND begins_with(sk, :skPrefix)",
      ExpressionAttributeValues: {
        ":pk": "PHOTOS",
        ":skPrefix": "PHOTO#",
      },
    });

    const res = await ddb.send(command);

    return res.Items as ImageData[];
  };
}
