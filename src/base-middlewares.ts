import { Middleware } from "@oak/oak";
import { logAccessRequests } from "./logging/access-logging.ts";

export function baseMiddlewares(): Middleware {
  return logAccessRequests;
}
