import { Image } from "@galleri/core/image";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const app = new Hono();

/**
 * Get image info
 */
app.get("/:id", async (c) => {
  const id = c.req.param("id");

  const image = await Image.get(id);

  return c.json(image);
});

/**
 * Get images info
 */
app.get("/", async (c) => {
  const images = await Image.list();

  return c.json(images);
});

/**
 * Remove images
 */
app.delete("/remove", zValidator("json", z.string().array()), async (c) => {
  const imageIds = c.req.valid("json");
  await Image.remove(imageIds);

  return c.json(imageIds);
});

export default app;
