import { Router } from '@oak/oak';
import { registerCreateFileShareLink } from './create-file-link.ts';
import { registerGetSharedFilesRoutes } from './get-shared-file.ts';

export function registerAllFileShareRoutes(router: Router) {
    registerCreateFileShareLink(router);
    registerGetSharedFilesRoutes(router);
}
