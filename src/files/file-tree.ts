import { existsSync } from "@std/fs/exists";
import { join } from "@std/path/join";

export type PathResult = { type: "invalid" } | {
  type: "valid";
  fullPath: string;
};

export type ListDirectoryResult = {
  type: "none";
} | {
  type: "found";
  files: Deno.DirEntry[];
};

export class FileTree {
  private readonly root: string;

  constructor(root: string) {
    this.root = Deno.realPathSync(root);
  }

  isValid(): boolean {
    return existsSync(this.root, { isDirectory: true });
  }

  resolvePath(relativePath: string): PathResult {
    try {
      const resolved = Deno.realPathSync(join(this.root, relativePath));
      if (resolved.startsWith(this.root)) {
        return {
          type: "valid",
          fullPath: resolved,
        };
      } else {
        return {
          type: "invalid",
        };
      }
    } catch {
      return {
        type: "invalid",
      };
    }
  }

  listDirectory(relativePath: string): ListDirectoryResult {
    const dir = this.resolvePath(relativePath);
    if (dir.type === "invalid") {
      return { type: "none" };
    }
    try {
      return {
        type: "found",
        files: Deno.readDirSync(dir.fullPath).toArray(),
      };
    } catch {
      return { type: "none" };
    }
  }
}
