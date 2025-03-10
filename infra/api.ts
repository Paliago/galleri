import { bucket, table } from "./storage";

export const api = new sst.aws.Function("Api", {
  url: true,
  link: [bucket, table],
  nodejs: { install: ["sharp"] },
  handler: "packages/functions/src/api.handler",
  timeout: "5 minutes",
});
