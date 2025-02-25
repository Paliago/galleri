import { api } from "./api";
import { router } from "./router";

export const web = new sst.aws.StaticSite("React", {
  path: "packages/web",
  build: {
    command: "bun run build",
    output: "dist",
  },
  environment: {
    VITE_API_URL: api.url,
    VITE_CDN_URL: $interpolate`${router.url}/files/`,
  },
});
