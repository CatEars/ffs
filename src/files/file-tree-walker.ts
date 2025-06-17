import { walk, WalkEntry } from "@std/fs/walk";
import { relative } from "@std/path/relative";
import { dirname } from "@std/path/dirname";

const keepAllWalkEntries = (_: WalkEntry) => true;

export class FileTreeWalker {
  private readonly root: string;
  private filter: (entry: WalkEntry) => boolean = keepAllWalkEntries;
  constructor(root: string) {
    this.root = root;
  }

  filterOut(filter: (entry: WalkEntry) => boolean) {
    this.filter = filter;
  }

  async *walk() {
    for await (
      const entry of walk(this.root, {
        includeDirs: false,
        includeFiles: true,
        includeSymlinks: false,
      })
    ) {
      if (!this.filter(entry)) {
        continue;
      }
      yield {
        parent: "/" + dirname(relative(this.root, entry.path)) + "/",
        name: entry.name,
      };
    }
  }

  async collectAll() {
    const result = [];
    for await (const entry of this.walk()) {
      result.push(entry);
    }
    return result;
  }
}
