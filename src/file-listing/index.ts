import { Router } from '@oak/oak/router';
import { registerDirectoryRoutes } from './list-directory.ts';
import { registerFileRoutes } from './get-file.ts';
import { registerUploadFileRoute } from './upload-file.ts';
import { registerMoveFileRoute } from './move-file.ts';
import { registerRenameFileRoute } from './rename-file.ts';

export function registerAllFileListing(router: Router) {
    registerDirectoryRoutes(router);
    registerFileRoutes(router);
    registerUploadFileRoute(router);
    registerMoveFileRoute(router);
    registerRenameFileRoute(router);
}
