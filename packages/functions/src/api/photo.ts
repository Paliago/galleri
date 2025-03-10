import { Photo } from "@galleri/core/photo";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const app = new Hono();

/**
 * Get photo info
 */
app.get("/:id", async (c) => {
  const id = c.req.param("id");

  const photo = await Photo.get(id);

  return c.json(photo);
});

/**
 * Get photos info
 */
app.get("/", async (c) => {
  const photos = await Photo.list();

  return c.json(photos);
});

/**
 * Remove photos
 */
app.delete("/remove", zValidator("json", z.string().array()), async (c) => {
  const photoIds = c.req.valid("json");
  await Photo.remove(photoIds);

  return c.json(photoIds);
});

export default app;
