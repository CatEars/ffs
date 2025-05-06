import { Middleware, Next } from "@oak/oak/middleware";
import { Context } from "@oak/oak/context";
import { getApiKey, shouldAbandonSecurity } from "../config.ts";
import { HTTP_401_UNAUTHORIZED } from "../utils/http-codes.ts";

export const apiProtect: Middleware = (ctx: Context, next: Next) => {
  if (shouldAbandonSecurity()) {
    return next();
  }
  if (ctx.request.headers.get("Authorization") === `FFS ${getApiKey()}`) {
    return next();
  } else {
    ctx.response.status = HTTP_401_UNAUTHORIZED;
  }
};
