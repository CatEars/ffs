import { Middleware, Next } from "@oak/oak/middleware";
import { Context } from "@oak/oak/context";
import { shouldAbandonSecurity } from "../config.ts";
import { HTTP_401_UNAUTHORIZED } from "../utils/http-codes.ts";
import { getUserMatchingApiKey } from "./users.ts";

export const apiProtect: Middleware = (ctx: Context, next: Next) => {
  if (shouldAbandonSecurity()) {
    return next();
  }

  const authHeader = ctx.request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("FFS ")) {
    const apiKey = authHeader.substring("FFS ".length);
    const user = getUserMatchingApiKey(apiKey);
    if (user) {
      return next();
    }
  }
  ctx.response.status = HTTP_401_UNAUTHORIZED;
};
