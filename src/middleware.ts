import { createOryMiddleware } from "@ory/nextjs/middleware";
import oryConfig from "./ory.config";

export const middleware = createOryMiddleware(oryConfig);

export const config = {
  matcher: [
    "/login",
    "/registration",
    "/recovery",
    "/verification",
    "/user-settings",
    "/self-service/:path*",
    "/sessions/:path*",
    "/.well-known/ory/:path*",
  ],
};
