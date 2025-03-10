import {
  BatchWriteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { Resource } from "sst/resource";
import { z } from "zod";
import { ddb } from "../lib/ddb";
import { randomUUID } from "node:crypto";
import { Photo } from "../photo";

export namespace Album {
  export const radiuses = z.union([
    z.literal("none"),
    z.literal("sm"),
    z.literal("md"),
    z.literal("lg"),
    z.literal("xl"),
    z.literal("full"),
  ]);
  export type Radius = z.infer<typeof radiuses>;

  const stylingSchema = z.object({
    borderRadius: radiuses,
    dark: z.boolean(),
  });

  export const schema = z.object({
    pk: z.literal("ALBUMS"),
    sk: z.string().startsWith("ALBUM#"),
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    createdAt: z.string().datetime(),
    albumCover: z.string().optional(),
    deletedAt: z.string().datetime().optional(),
    expireAt: z.number().optional(),
    styling: stylingSchema,
  });

  export const schemaWithoutKeys = schema.omit({ pk: true, sk: true });
  export const createSchema = schemaWithoutKeys.omit({
    id: true,
    createdAt: true,
  });
  export type CreateAlbum = z.infer<typeof createSchema>;

  export type Album = z.infer<typeof schema>;

  const partialSchemaWithoutKeys = createSchema.partial();
  type PartialSchemaWithoutKeys = z.infer<typeof partialSchemaWithoutKeys>;

  export const addPhotosSchema = z.array(z.string().startsWith("PHOTO#"));

  export const create = async (body: {
    name: string;
    description?: string;
    albumCover?: string;
    styling?: { borderRadius: string; dark: boolean };
  }) => {
    const albumId = randomUUID().split("-")[0];
    const createBody = schemaWithoutKeys.parse({
      id: albumId,
      createdAt: new Date().toISOString(),
      ...body,
    });
    await ddb.send(
      new PutCommand({
        TableName: Resource.Table.name,
        Item: {
          pk: "ALBUMS",
          sk: `ALBUM#${albumId}`,
          ...createBody,
        },
      }),
    );

    return albumId;
  };

  export const update = async (
    albumId: string,
    body: PartialSchemaWithoutKeys,
  ) => {
    const updateExpression: string[] = [];
    const expressionAttributeValues: {
      // biome-ignore lint/suspicious/noExplicitAny: it is parsed already
      [key: string]: any;
    } = {};

    for (const key of Object.keys(body) as (keyof PartialSchemaWithoutKeys)[]) {
      updateExpression.push(`#${key} = :${key}`);
      expressionAttributeValues[`:${key}`] = body[key];
    }

    const command = new UpdateCommand({
      TableName: Resource.Table.name,
      Key: {
        pk: "ALBUMS",
        sk: `ALBUM#${albumId}`,
      },
      UpdateExpression: `SET ${updateExpression.join(", ")}`,
      ExpressionAttributeNames: Object.keys(body).reduce(
        (acc: { [key: string]: string }, key) => {
          acc[`#${key}`] = key;
          return acc;
        },
        {},
      ),
      ExpressionAttributeValues: expressionAttributeValues,
    });

    await ddb.send(command);

    return albumId;
  };

  export const get = async (id: string) => {
    const command = new GetCommand({
      TableName: Resource.Table.name,
      Key: {
        pk: "ALBUMS",
        sk: `ALBUM#${id}`,
      },
    });

    const res = await ddb.send(command);

    return res.Item as Album | undefined;
  };

  export const list = async () => {
    const command = new QueryCommand({
      TableName: Resource.Table.name,
      KeyConditionExpression: "pk = :pk AND begins_with(sk, :skPrefix)",
      ExpressionAttributeValues: {
        ":pk": "ALBUMS",
        ":skPrefix": "ALBUM",
      },
    });

    const res = await ddb.send(command);

    return res.Items as Album[];
  };

  // TODO: add a ddb stream handler that removes all AlbumPhotoRelations when an album is deleted
  export const remove = async (albumId: string) => {
    const command = new UpdateCommand({
      TableName: Resource.Table.name,
      Key: {
        pk: "ALBUMS",
        sk: `ALBUM#${albumId}`,
      },
      UpdateExpression: "SET #expireAt = :expireAt, #deletedAt = :deletedAt",
      ExpressionAttributeNames: {
        "#expireAt": "expireAt",
        "#deletedAt": "deletedAt",
      },
      ExpressionAttributeValues: {
        ":expireAt": Math.floor(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
        ":deletedAt": new Date().toISOString(),
      },
    });

    await ddb.send(command);

    return albumId;
  };

  const albumPhotoRelationSchema = z.object({
    pk: z.string().startsWith("ALBUM#"),
    sk: z.string().startsWith("PHOTO#"),
    albumId: z.string(),
    photoId: z.string(),
    createdAt: z.string().datetime(),
    order: z.number().optional(),
  });
  export type AlbumPhotoRelation = z.infer<typeof albumPhotoRelationSchema>;

  export const albumPhotoSchema = z.intersection(
    Photo.schemaWithoutId,
    albumPhotoRelationSchema.pick({ order: true }),
  );
  export type AlbumPhoto = z.infer<typeof albumPhotoSchema>;

  export const listPhotos = async (albumId: string) => {
    const command = new QueryCommand({
      TableName: Resource.Table.name,
      KeyConditionExpression: "pk = :pk AND begins_with(sk, :skPrefix)",
      FilterExpression: "attribute_not_exists(expireAt)",
      ExpressionAttributeValues: {
        ":pk": `ALBUM#${albumId}`,
        ":skPrefix": "PHOTO#",
      },
    });

    const res = await ddb.send(command);

    return res.Items as AlbumPhotoRelation[];
  };

  export const addPhotos = async (albumId: string, photoIds: string[]) => {
    const createdAt = new Date().toISOString();

    const requestItems = photoIds.map((photoId) => ({
      PutRequest: {
        Item: {
          pk: `ALBUM#${albumId}`,
          sk: `PHOTO#${photoId}`,
          albumId: albumId,
          photoId: photoId,
          createdAt: createdAt,
        },
      },
    }));

    const command = new BatchWriteCommand({
      RequestItems: {
        [Resource.Table.name]: requestItems,
      },
    });

    await ddb.send(command);

    return albumId;
  };
}
