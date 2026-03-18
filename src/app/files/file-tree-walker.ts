import { walk, WalkEntry, WalkOptions } from '@std/fs/walk';
import { relative } from '@std/path/relative';
import { dirname } from '@std/path/dirname';

const keepAllWalkEntries = (_: WalkEntry) => true;

export class FileTreeWalker {
    private readonly root: string;
    private readonly options: WalkOptions;
    private _filter: (entry: WalkEntry) => boolean = keepAllWalkEntries;
    constructor(root: string, walkOptions?: WalkOptions) {
        this.root = root;
        this.options = walkOptions || {};
    }

    filter(filter: (entry: WalkEntry) => boolean) {
        this._filter = filter;
    }

    async *walk() {
        for await (
            const entry of walk(this.root, {
                includeDirs: false,
                includeFiles: true,
                includeSymlinks: false,
                ...this.options,
            })
        ) {
            if (!this._filter(entry)) {
                continue;
            }
            const parent = '/' + dirname(relative(this.root, entry.path)) + '/';
            yield {
                parent: parent === '/./' ? '/' : parent,
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
