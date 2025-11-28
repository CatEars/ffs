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

        const resultingFiles: ApiFile[] = [];
        for (const listingResult of listing.files) {
            const statResult = await fileTree.stat(listing, listingResult.name);
            if (statResult.type === 'valid') {
                const date = statResult.info.mtime || statResult.info.ctime || new Date(0);
                const resultingFile = {
                    ...listingResult,
                    ...identifyFileFromDirEntry(statResult.fullPath, listingResult),
                    date,
                };
                resultingFiles.push(resultingFile);
            }
        }

        ctx.response.body = resultingFiles;
    });
}
