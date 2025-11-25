import { Router } from '@oak/oak/router';
import { HTTP_404_NOT_FOUND } from '../utils/http-codes.ts';
import { baseMiddlewares, protectedMiddlewares } from '../base-middlewares.ts';
import { FileIdentification, identifyFileFromDirEntry } from './file-type.ts';
import { FfsApplicationState } from '../application-state.ts';

type ApiFile = Deno.DirEntry & FileIdentification & {
    date: Date;
};

export function registerDirectoryRoutes(router: Router<FfsApplicationState>) {
    router.get('/api/directory', baseMiddlewares(), ...protectedMiddlewares(), async (ctx) => {
        const fileTree = ctx.state.fileTree;
        const pathToCheck = ctx.request.url.searchParams.get('path');
        if (!pathToCheck) {
            ctx.response.status = HTTP_404_NOT_FOUND;
            return;
        }

        const listing = await fileTree.listDirectory(pathToCheck);
        if (listing.type === 'none') {
            ctx.response.status = HTTP_404_NOT_FOUND;
            return;
        }

        const results: ApiFile[] = [];
        for (const result of listing.files) {
            const fileStat = await fileTree.stat(listing, result.name);
            if (fileStat.type === 'invalid') {
                continue;
            }
            const date = fileStat.info.ctime || fileStat.info.mtime || new Date(0);
            const resolvedPath = await fileTree.resolvePath(pathToCheck, result.name);
            if (resolvedPath.type === 'invalid') {
                continue;
            }

            const fileIdentification = identifyFileFromDirEntry(resolvedPath.fullPath, result);
            results.push({ ...result, ...fileIdentification, date });
        }

        ctx.response.body = results;
    });
}
