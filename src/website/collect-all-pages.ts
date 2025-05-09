import { Context } from "@oak/oak/context";
import { viewPath } from "../config.ts";
import { Router } from "@oak/oak/router";
import { Middleware } from "@oak/oak/middleware";

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

export type PluginPage = {
  type: "Plugin";
  displayName: string;
  register: (router: Router) => Promise<void>;
};

export type Page = PlainPage | PluginPage;

type FileEntry = {
  parent: string;
  name: string;
};

function collectDirectoryTree() {
  const root = viewPath;
  const foundDirectories = [{
    actualPath: root,
    name: "/",
  }];
  const allEntries: FileEntry[] = [];
  for (let idx = 0; idx < foundDirectories.length; ++idx) {
    const currentDirectory = foundDirectories[idx];
    if (currentDirectory.name === "/templates/") {
      // Specifically skip the /views/templates directory. It should only be used by `eta`
      continue;
    }
    const entries = Deno.readDirSync(currentDirectory.actualPath);
    for (const entry of entries) {
      if (entry.isDirectory) {
        foundDirectories.push({
          actualPath: currentDirectory.actualPath + `${entry.name}/`,
          name: currentDirectory.name + `${entry.name}/`,
        });
      } else if (entry.isFile) {
        allEntries.push({
          parent: currentDirectory.name,
          name: entry.name,
        });
      }
    }
  }
  return allEntries;
}

export async function collectAllPages(): Promise<Page[]> {
  const allEntries = collectDirectoryTree();
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
    let webPath = `${html.parent}${html.name}`;
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
