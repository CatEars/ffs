import { Context } from '@oak/oak/context';
import { getStoreRoot } from '../config.ts';
import { FileTree } from '../files/file-tree.ts';
import { FfsApplicationState } from '../application-state.ts';
import { ResourceManager } from '../security/resources.ts';

let _fileTree: FileTree | null = null;
export function getRootFileTree() {
    if (_fileTree != null) {
        return _fileTree;
    }
    _fileTree = new FileTree(getStoreRoot());
    return _fileTree;
}

const fileResourceManger = new ResourceManager('file');

export async function resolveUserFileTreeFromState(ctx: Context<FfsApplicationState>) {
    ctx.state.fileTree = getRootFileTree();
    const fileAccess = fileResourceManger.getFirstMatchingAccessLevel(
        ctx.state.userPermissions.access,
    );
    if (fileAccess) {
        const resolvedFileAccess = fileResourceManger.stripResourceTypeName(fileAccess);
        if (resolvedFileAccess !== fileResourceManger.rootResourceName()) {
            ctx.state.fileTree = await ctx.state.fileTree.withSubfolderOrThrow(
                ...resolvedFileAccess,
            );
        }
    }
}
