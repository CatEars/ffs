import { Router } from "@oak/oak/router";
import {
  HTTP_400_BAD_REQUEST,
  HTTP_404_NOT_FOUND,
} from "../utils/http-codes.ts";
import { getMatchingUser } from "../security/users.ts";

export function registerBasicAuthRoutes(router: Router) {
  router.post("/api/logon", async (ctx) => {
    const body = await ctx.request.body.json();
    if (!body.username || !body.password) {
      ctx.response.status = HTTP_400_BAD_REQUEST;
      return;
    }

    const matchingUser = await getMatchingUser(body.username, body.password);
    if (!matchingUser) {
      ctx.response.status = HTTP_404_NOT_FOUND;
      return;
    }

    ctx.response.body = {
      "isOk": true,
      "key": matchingUser,
    };
  });
}
