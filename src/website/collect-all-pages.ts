import { viewPath } from "../config.ts";
import { Router } from "@oak/oak/router";
import { Middleware } from "@oak/oak/middleware";
import { FileTreeWalker } from "../files/file-tree-walker.ts";

export type PlainPage = {
  type: "Plain";
  webPath: string;
  filePath: string;
  middlewares: Middleware[];
};

export type NavbarLink = {
  displayText: string;
  webPath: string;
};

export type ApplicationContext = {
  router: Router;
  navbarLinks: NavbarLink[];
};

export type PluginPage = {
  type: "Plugin";
  displayName: string;
  register: (context: ApplicationContext) => Promise<void>;
};

export type StaticJsPage = {
  type: "Js";
  webPath: string;
  filePath: string;
};

export type Page = PlainPage | PluginPage | StaticJsPage;

function isUnderTemplateDirectory(path: string) {
  return path.includes("/templates/");
}

function isPartialHtmlFile(path: string) {
  return path.endsWith(".partial.html");
}

async function collectDirectoryTree() {
  const walker = new FileTreeWalker(viewPath);
  walker.filter((entry) => {
    return !isUnderTemplateDirectory(entry.path) &&
      !isPartialHtmlFile(entry.name);
  });
  return await walker.collectAll();
}

export async function collectAllPages(): Promise<Page[]> {
  const allEntries = await collectDirectoryTree();
  const htmls = allEntries.filter((entry) => entry.name.endsWith(".html"));
  const denos = allEntries.filter((entry) => entry.name.endsWith(".ts"));
  const javascripts = allEntries.filter((entry) => entry.name.endsWith(".js"));
  const pages: Page[] = [];
  for (const html of htmls) {
    const pageName = html.name.substring(0, html.name.length - ".html".length);
    const matchingDeno = denos.find((x) =>
      x.parent === html.parent && x.name.startsWith(pageName)
    );
    let middlewares: Middleware[] = [];
    if (matchingDeno) {
      const importedDeno = await import(
        `${viewPath}${matchingDeno.parent.substring(1)}${matchingDeno.name}`
      );
      if (importedDeno.middlewares) {
        middlewares = importedDeno.middlewares;
      }
    }
    let webPath = `${html.parent}${pageName}`;
    if (pageName === "index") {
      webPath = html.parent;
    }
    pages.push({
      type: "Plain",
      filePath: `${html.parent}${html.name}`,
      webPath,
      middlewares,
    });
  }

  for (const deno of denos) {
    const importedDeno = await import(
      `${viewPath}${deno.parent.substring(1)}${deno.name}`
    );
    if (importedDeno.register) {
      pages.push({
        type: "Plugin",
        displayName: `${deno.parent}${deno.name}`,
        register: importedDeno.register,
      });
    }
  }

  for (const js of javascripts) {
    const { parent, name } = js;
    const webPath = `${parent}${name}`;
    pages.push({
      type: "Js",
      filePath: `${parent.substring(1)}${name}`,
      webPath,
    });
  }

  return pages;
}
