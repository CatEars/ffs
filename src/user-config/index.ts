import { Context, Middleware } from '@oak/oak';
import { FileTree } from '../files/file-tree.ts';

// deno-lint-ignore no-explicit-any
export type UserConfig = any;

export type FfsApplicationState = {
    fileTree: FileTree;
    userConfig?: UserConfig;
};

export type UserConfigToStateSetter = (ctx: Context<FfsApplicationState>) => void;

const configSetters: UserConfigToStateSetter[] = [];

export function registerUserConfigStateSetter(func: UserConfigToStateSetter) {
    configSetters.push(func);
}

export const resolveUserConfigToState: Middleware<FfsApplicationState> = (ctx, next) => {
    for (const setter of configSetters) {
        setter(ctx);
    }
    return next();
};
