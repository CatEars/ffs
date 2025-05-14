import { Router } from "@oak/oak/router";
import {
  HTTP_400_BAD_REQUEST,
  HTTP_404_NOT_FOUND,
} from "../utils/http-codes.ts";
import { getMatchingUser } from "../security/users.ts";
import { baseMiddlewares } from "../base-middlewares.ts";

export function registerBasicAuthRoutes(router: Router) {
  router.post("/api/logon", baseMiddlewares(), async (ctx) => {
    const body = await ctx.request.body.json();
    if (!body.username || !body.password) {
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

  router.post("/api/user-logon", baseMiddlewares(), async (ctx) => {
    const data = await ctx.request.body.form();
    const username = data.get("username");
    const password = data.get("password");
    if (!username || !password) {
      ctx.response.status = HTTP_400_BAD_REQUEST;
      return;
    }

    const matchingUser = await getMatchingUser(username, password);

    if (!matchingUser) {
      ctx.response.redirect("/logon/fail");
      return;
    }

    ctx.cookies.set("FFS-Authorization", matchingUser);
    ctx.response.redirect("/home/");
  });
}
