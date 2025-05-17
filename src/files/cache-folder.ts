import path from "node:path";
import { logger } from "../logging/logger.ts";

const cachePrefix = "ffs-cachedir-";

async function priorTempDirectory() {
  try {
    for await (const entry of Deno.readDir(path.resolve("/", "tmp"))) {
      if (entry.isDirectory && entry.name.startsWith(cachePrefix)) {
        return path.resolve("/", "tmp", entry.name);
      }
    }
  } catch {
    // Intetionally left empty
  }
}

export async function resolveCacheFolder() {
  const envEntry = Deno.env.get("FFS_CACHE_FOLDER");
  const prior: string | undefined = await priorTempDirectory();
  if (envEntry && (await Deno.stat(envEntry)).isDirectory) {
    return envEntry;
  } else if (prior) {
    logger.debug(
      "Found prior cache folder",
      prior,
      "and will use that over creating new",
    );
    return prior;
  } else {
    return await Deno.makeTempDir({ prefix: cachePrefix });
  }
}
