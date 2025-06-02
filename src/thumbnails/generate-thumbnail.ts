import { ThumbnailRequest } from "./types.ts";
import { extname } from "@std/path";
import { createMp4Thumbnail } from "./nailers/mp4.ts";

type Thumbnailer = {
  extName: string;
  handler: (thumbnail: ThumbnailRequest) => Promise<void>;
};

const nailers: Thumbnailer[] = [
  {
    extName: ".mp4",
    handler: createMp4Thumbnail,
  },
  {
    extName: ".m4v",
    handler: createMp4Thumbnail,
  },
];

const extNames = nailers.map((x) => x.extName);

export async function generateThumbnail(thumbnail: ThumbnailRequest) {
  const ext = extname(thumbnail.filePath);
  for (const nailer of nailers) {
    if (ext === nailer.extName) {
      await nailer.handler(thumbnail);
      return;
    }
  }
}

export function canGenerateThumbnailFor(filePath: string) {
  return extNames.includes(extname(filePath));
}
