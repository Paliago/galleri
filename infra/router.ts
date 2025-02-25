import { api } from "./api";
import { bucket } from "./storage";
import { web } from "./web";

export const router = new sst.aws.Router("Main", {
  // domain: "galleri.se",
  routes: {
    // "/*": web.url,
    "/api/*": api.url,
    "/files/*": {
      bucket,
      rewrite: {
        regex: "^/files/(.*)$",
        to: "/photos/$1",
      },
    },
  },
});
