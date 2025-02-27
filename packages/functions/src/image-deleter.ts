import { Image } from "@galleri/core/image";
import type { DynamoDBStreamHandler } from "aws-lambda";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import type { AttributeValue } from "@aws-sdk/client-dynamodb";

export const handler: DynamoDBStreamHandler = async (event) => {
  console.log(event);
  for (const record of event.Records) {
    console.log(record);
    if (record.dynamodb?.OldImage) {
      // cast to the correct AttributeValue type
      const oldImage = record.dynamodb.OldImage as Record<
        string,
        AttributeValue
      >;
      const unmarshalled = unmarshall(oldImage);

      console.log("Removing image from bucket");
      console.log(unmarshalled.urls);
      await Image.removeFromBucket(unmarshalled.urls);
    }
  }
};
