import { Context } from "@oak/oak/context";

export type PlainHtml = {
  type: "PlainHtml";
  webPaths: string[];
  etaPath: string;
};

export type CompileTimeDynamicHtml = {
  type: "CompileTimeDynamicHtml";
  webPaths: string[];
  etaPath: string;
  getTemplateData: () => object;
};

export type RunTimeDynamicHtml = {
  type: "RunTimeDynamicHtml";
  webPaths: string[];
  etaPath: string;
  getTemplateData: (ctx: Context) => Promise<object>;
};

export type Page = PlainHtml | CompileTimeDynamicHtml | RunTimeDynamicHtml;

export function collectAllPages(): Page[] {
  return [
    {
      type: "PlainHtml",
      webPaths: ["/"],
      etaPath: "/index.html",
    },
    {
      type: "PlainHtml",
      webPaths: ["/logon"],
      etaPath: "/logon/index.html",
    },
  ];
}
