import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { logger } from "hono/logger";
import photoRoute from "./api/photo";
import uploadRoute from "./api/upload";
import albumRoute from "./api/album";

const app = new Hono().use(logger());

const routes = app
  .route("/photo", photoRoute)
  .route("/upload", uploadRoute)
  .route("/album", albumRoute);

export type AppType = typeof routes;

export const handler = handle(app);
