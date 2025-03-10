import { Upload } from "@galleri/core/upload";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { randomUUID } from "node:crypto";

const app = new Hono();

/**
 * Gets presigned url
 */
app.post("/", zValidator("json", Upload.schema), async (c) => {
  const { contentType, size } = c.req.valid("json");

  const photoId = randomUUID().split("-")[0];
  const extension = contentType.split("/")[1].replace("jpeg", "jpg");
  const filename = `${photoId}.${extension}`;
  const key = `photos/original/${filename}`;

  const signedUrl = await Upload.signUrl(photoId, key, contentType);

  await Upload.addInitialMetadata({
    photoId,
    filename,
    size,
    contentType,
    key,
  });

  return c.json({ uploadUrl: signedUrl, photoId, extension });
});

export default app;
