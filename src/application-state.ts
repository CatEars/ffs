import { Context } from '@oak/oak/context';
import { FileTree } from './files/file-tree.ts';
import { AccessLevel, getRootAccessLevel } from './security/resources.ts';

export type UserConfig = {
    access: AccessLevel[];
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
    };
    if (config?.access) {
        userConfig.access = config.access;
    } else {
        userConfig.access = getRootAccessLevel();
    }
    ctx.state.userConfig = userConfig;
}
