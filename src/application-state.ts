import { Context } from '@oak/oak/context';
import { FileTree } from './files/file-tree.ts';
import { AccessLevel, rootAccessLevel } from './security/resources.ts';

export type UserConfig = {
    access: AccessLevel[];
    userRootPath: string;
};

export type FfsApplicationState = {
    fileTree: FileTree;
    userConfig: UserConfig;
};

export function setAccessFromUserConfigOrDefaultToRootAccess(
    ctx: Context<FfsApplicationState>,
    config?: Partial<UserConfig>,
) {
    const userConfig: UserConfig = {
        access: [],
        userRootPath: '.',
    };
    if (config?.access) {
        userConfig.access = config.access;
    } else {
        userConfig.access = [rootAccessLevel];
    }
    ctx.state.userConfig = userConfig;
}
