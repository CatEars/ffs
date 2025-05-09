import { Router } from "@oak/oak/router";
import {
  HTTP_400_BAD_REQUEST,
  HTTP_404_NOT_FOUND,
} from "../utils/http-codes.ts";
import { getMatchingUser } from "../security/users.ts";
import { Context } from "node:vm";

export function registerBasicAuthRoutes(router: Router) {
  router.post("/api/logon", async (ctx) => {
    const result = await doLogon(ctx, await ctx.request.body.json());
    if (result === undefined) {
      return;
    }

    if (!result.isOk) {
      ctx.response.status = HTTP_404_NOT_FOUND;
      return;
    }

    ctx.response.body = result;
  });

  router.post("/api/user-logon", async (ctx) => {
    const data = await ctx.request.body.form();
    data.get("username");
    const result = await doLogon(ctx, {
      username: data.get("username"),
      password: data.get("password"),
    });
    if (result === undefined) {
      return;
    }

    if (!result.isOk) {
      ctx.response.redirect("/logon/fail");
      return;
    }

    ctx.cookies.set("FFS-Authorization", result.key);
    ctx.response.redirect("/home/");
  });
}

async function doLogon(
  ctx: Context,
  body: { username?: string | null; password?: string | null },
) {
  if (!body.username || !body.password) {
    ctx.response.status = HTTP_400_BAD_REQUEST;
    return;
  }

  const matchingUser = await getMatchingUser(body.username, body.password);
  if (!matchingUser) {
    return {
      "isOk": false,
      "key": "",
    };
  }

  return {
    "isOk": true,
    "key": matchingUser,
  };
}
