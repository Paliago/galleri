export const bucket = new sst.aws.Bucket("Storage", { access: "cloudfront" });

export const table = new sst.aws.Dynamo("Table", {
  fields: {
    pk: "string",
    sk: "string",
  },
  primaryIndex: { hashKey: "pk", rangeKey: "sk" },
  stream: "new-and-old-images",
  ttl: "expireAt",
});

bucket.notify({
  notifications: [
    {
      events: ["s3:ObjectCreated:*"],
      filterPrefix: "photos/original/",
      name: "resizer",
      function: {
        handler: "packages/functions/src/resizer.handler",
        link: [bucket, table],
        nodejs: { install: ["sharp"] },
        timeout: "10 minutes",
      },
    },
  ],
});

table.subscribe(
  "ImageDeleter",
  { handler: "packages/functions/src/image-deleter.handler", link: [bucket] },
  {
    filters: [
      {
        eventName: ["REMOVE"],
        dynamodb: {
          Keys: {
            pk: {
              S: ["PHOTOS"],
            },
          },
        },
      },
    ],
  },
);
