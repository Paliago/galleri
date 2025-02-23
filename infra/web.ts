import { api } from "./api";

new sst.aws.StaticSite("React", {
  path: "packages/web",
  build: {
    command: "bun run build",
    output: "dist",
  },
  environment: {
    VITE_API_URL: api.url,
  },
});
