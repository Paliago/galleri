export const bucket = new sst.aws.Bucket("Storage");
export const table = new sst.aws.Dynamo("Table", {
  fields: {
    pk: "string",
    sk: "string",
  },
  primaryIndex: { hashKey: "pk", rangeKey: "sk" },
});
