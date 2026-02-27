import { Context } from '@oak/oak/context';
import { FileTree } from './files/file-tree.ts';
import { AccessLevel, getRootAccessLevel } from './security/resources.ts';

export type UserPermissions = {
    access: AccessLevel[];
    canCreateUsers?: boolean;
    allowHousekeeping?: boolean;
};

export type FfsApplicationState = {
    fileTree: FileTree;
    userPermissions: UserPermissions;
};

export function setPermissionsFromUserOrDefaultToRootAccess(
    ctx: Context<FfsApplicationState>,
    permissions?: Partial<UserPermissions>,
) {
    const userPermissions: UserPermissions = {
        access: [],
    };
    if (permissions?.access) {
        userPermissions.access = permissions.access;
    } else {
        userPermissions.access = getRootAccessLevel();
    }
    if (permissions?.canCreateUsers) {
        userPermissions.canCreateUsers = permissions.canCreateUsers;
    }
    userPermissions.allowHousekeeping = permissions?.allowHousekeeping !== false;
    ctx.state.userPermissions = userPermissions;
}
