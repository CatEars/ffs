import { getStoreRoot } from '../config.ts';
import { FileTree } from '../files/file-tree.ts';
import { UserConfigToStateSetter } from '../user-config/index.ts';

let _fileTree: FileTree | null = null;
export function getRootFileTree() {
    if (_fileTree != null) {
        return _fileTree;
    }
    _fileTree = new FileTree(getStoreRoot());
    return _fileTree;
}

export const resolveUserFileTreeIntoState: UserConfigToStateSetter = (ctx) => {
    if (ctx.state && ctx.state.userConfig && ctx.state.userConfig.userRootPath) {
        ctx.state.fileTree = ctx.state.fileTree.withSubfolderOrThrow(
            ctx.state.userConfig.userRootPath,
        );
    }
};
