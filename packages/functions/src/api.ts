import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { logger } from "hono/logger";
import imageRoute from "./api/image";
// import albumRoute from "./api/album";

const app = new Hono().use(logger());

const routes = app.route("/image", imageRoute);
// .route("/album", albumRoute);

export type AppType = typeof routes;

export const handler = handle(app);
