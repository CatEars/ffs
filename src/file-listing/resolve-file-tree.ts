import { Context } from '@oak/oak/context';
import { getStoreRoot } from '../config.ts';
import { FileTree } from '../files/file-tree.ts';
import { FfsApplicationState } from '../application-state.ts';

let _fileTree: FileTree | null = null;
export function getRootFileTree() {
    if (_fileTree != null) {
        return _fileTree;
    }
    _fileTree = new FileTree(getStoreRoot());
    return _fileTree;
}

export function resolveUserFileTreeFromState(ctx: Context<FfsApplicationState>) {
    ctx.state.fileTree = getRootFileTree();
    if (ctx.state.userConfig && ctx.state.userConfig.userRootPath) {
        ctx.state.fileTree = ctx.state.fileTree.withSubfolderOrThrow(
            ctx.state.userConfig.userRootPath,
        );
    }
}
