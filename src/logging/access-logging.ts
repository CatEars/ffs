import { Middleware } from "@oak/oak";
import { logger } from "./logger.ts";

export const logAccessRequests: Middleware = (ctx, next) => {
  logger.info(ctx.request.ip, "->", ctx.request.url.toString());
  return next();
};
