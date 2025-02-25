import { Image } from "@galleri/core/image";
import { Hono } from "hono";
import { getImgResponse } from "openimg/node";
import { getImgSource } from "../lib/image";
import { Resource } from "sst";

const app = new Hono();

/**
 * Get image info
 */
app.get("/:id", async (c) => {
  const id = c.req.param("id");

  const game = await Image.get(id);

  return c.json(game);
});

/**
 * Get images info
 */
app.get("/", async (c) => {
  const game = await Image.list();

  return c.json(game);
});

app.get("/test", (c) => {
  const headers = new Headers();
  headers.set("Cache-Control", "public, max-age=31536000, immutable");

  return getImgResponse(c.req.raw, {
    headers,
    getImgSource,
    allowlistedOrigins: [
      `https://${Resource.Storage.name}.s3.eu-north-1.amazonaws.com`,
    ],
  });
});

export default app;
