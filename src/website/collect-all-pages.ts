import { Context } from "@oak/oak/context";
import { viewPath } from "../config.ts";
import { Router } from "@oak/oak/router";
import { Middleware } from "@oak/oak/middleware";
import { walk } from "@std/fs/walk";
import { relative } from "@std/path/relative";
import { dirname } from "@std/path/dirname";

export type StaticLoader = () => object;
export type StaticPage = {
  getStaticData: StaticLoader;
};

export type DynamicLoader = (ctx: Context) => Promise<object>;
export type DynamicPage = {
  getDynamicData: DynamicLoader;
};

export type PlainPage = {
  type: "Plain";
  webPath: string;
  etaPath: string;
  getStaticData?: StaticLoader;
  getDynamicData?: DynamicLoader;
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

export type Page = PlainPage | PluginPage;

type FileEntry = {
  parent: string;
  name: string;
};

function isUnderTemplateDirectory(path: string) {
  return path.includes("/templates/");
}

function isPartialHtmlFile(path: string) {
  return path.endsWith(".partial.html");
}

async function collectDirectoryTree() {
  const allEntries: FileEntry[] = [];
  for await (
    const entry of walk(viewPath, {
      includeDirs: false,
      includeFiles: true,
      includeSymlinks: false,
    })
  ) {
    const parent = dirname(relative(viewPath, entry.path));
    const entryToSubmit: FileEntry = {
      parent: parent === "." ? "/" : `/${parent}/`,
      name: entry.name,
    };
    if (
      isUnderTemplateDirectory(entryToSubmit.parent) ||
      isPartialHtmlFile(entryToSubmit.name)
    ) {
      // Specifically skip /templates/ directories and partials. They are always included via `eta`
      continue;
    }
    allEntries.push(entryToSubmit);
  }
  return allEntries;
}

export async function collectAllPages(): Promise<Page[]> {
  const allEntries = await collectDirectoryTree();
  const htmls = allEntries.filter((entry) => entry.name.endsWith(".html"));
  const denos = allEntries.filter((entry) => entry.name.endsWith(".ts"));
  const pages: Page[] = [];
  for (const html of htmls) {
    const pageName = html.name.substring(0, html.name.length - ".html".length);
    const matchingDeno = denos.find((x) =>
      x.parent === html.parent && x.name.startsWith(pageName)
    );
    let getStaticData: StaticLoader | undefined = undefined;
    let getDynamicData: DynamicLoader | undefined = undefined;
    let middlewares: Middleware[] = [];
    if (matchingDeno) {
      const importedDeno = await import(
        `${viewPath}${matchingDeno.parent.substring(1)}${matchingDeno.name}`
      );
      if (importedDeno.getStaticData) {
        getStaticData = importedDeno.getStaticData;
      }
      if (importedDeno.getDynamicData) {
        getDynamicData = importedDeno.getDynamicData;
      }
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
      etaPath: `${html.parent}${html.name}`,
      webPath,
      getDynamicData,
      getStaticData,
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
  return pages;
}
