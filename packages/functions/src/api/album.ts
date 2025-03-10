import { zValidator } from "@hono/zod-validator";
import { Album } from "@galleri/core/album";
import { Hono } from "hono";
import { Photo } from "@galleri/core/photo";

const app = new Hono();

/**
 * Get album
 */
app.get("/:id", async (c) => {
  const id = c.req.param("id");

  const album = await Album.get(id);

  return c.json(album);
});

/**
 * Create album
 */
app.post("/", zValidator("json", Album.createSchema), async (c) => {
  const validated = c.req.valid("json");

  const result = await Album.create(validated);

  return c.json(result);
});

/**
 * Update album
 */
app.put("/:id", zValidator("json", Album.schema.partial()), async (c) => {
  const id = c.req.param("id");
  const validated = c.req.valid("json");

  const albumId = await Album.update(id, validated);

  return c.json(albumId);
});

/**
 * Remove album
 */
app.delete("/:id", async (c) => {
  const id = c.req.param("id");

  const albumId = await Album.remove(id);

  return c.json(albumId);
});

/**
 * List album
 */
app.get("/", async (c) => {
  const result = await Album.list();

  return c.json(result);
});

/**
 * List album photos
 */
app.get("/:id/photos", async (c) => {
  const id = c.req.param("id");

  const photoRelations = await Album.listPhotos(id);
  const photos = await Photo.batchGet(photoRelations.map((p) => p.photoId));
  if (!photos) {
    return c.json([]);
  }

  const photoMap = new Map(photos.map((photo) => [photo.photoId, photo]));

  const combinedResults = photoRelations
    .map((relation) => {
      const photo = photoMap.get(relation.photoId);
      if (!photo) {
        console.warn(`photo ${relation.photoId} not found`);
        return null;
      }

      return {
        ...photo,
        order: relation.order,
      };
    })
    .filter(Boolean);

  return c.json(combinedResults);
});

/**
 * Add photos to album
 */
app.post(
  "/:id/photos",
  zValidator("json", Album.addPhotosSchema),
  async (c) => {
    const id = c.req.param("id");
    const validated = c.req.valid("json");

    const photoIds = await Album.addPhotos(id, validated);

    return c.json(photoIds);
  },
);

export default app;
