export const bucket = new sst.aws.Bucket("Storage", { access: "cloudfront" });

export const table = new sst.aws.Dynamo("Table", {
  fields: {
    pk: "string",
    sk: "string",
  },
  primaryIndex: { hashKey: "pk", rangeKey: "sk" },
});

bucket.notify({
  notifications: [
    {
      events: ["s3:ObjectCreated:*"],
      filterPrefix: "photos/originals/",
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
