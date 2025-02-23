import { zValidator } from "@hono/zod-validator";
import { Album } from "@galleri/core/album";
import { Hono } from "hono";

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
app.post("/", zValidator("json", Album.schemaWithoutId), async (c) => {
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

export default app;
