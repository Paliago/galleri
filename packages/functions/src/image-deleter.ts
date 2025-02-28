import { Image } from "@galleri/core/image";
import type { DynamoDBStreamHandler } from "aws-lambda";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import type { AttributeValue } from "@aws-sdk/client-dynamodb";

export const handler: DynamoDBStreamHandler = async (event) => {
  console.log("Handling image deletion");
  for (const record of event.Records) {
    console.log(record.dynamodb);
    if (record.dynamodb?.OldImage) {
      const oldImage = record.dynamodb.OldImage as Record<
        string,
        AttributeValue
      >;
      try {
        const unmarshalled = unmarshall(oldImage);

        console.log("Removing image from bucket");
        await Image.removeFromBucket(unmarshalled.urls);
      } catch (error) {
        console.error("Failed to unmarshall image:", error);
      }
    }
  }
};
