import { Middleware } from "@oak/oak";
import { requestLogger } from "./logger.ts";

export const logAccessRequests: Middleware = (ctx, next) => {
  requestLogger.info(ctx.request.ip, "->", ctx.request.url.toString());
  return next();
};
