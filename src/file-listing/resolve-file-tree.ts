import { getStoreRoot } from '../config.ts';
import { FileTree } from '../files/file-tree.ts';

export function getRootFileTree() {
    return new FileTree(getStoreRoot());
}
