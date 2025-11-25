import { Router } from '@oak/oak/router';
import { HTTP_404_NOT_FOUND } from '../utils/http-codes.ts';
import { baseMiddlewares, protectedMiddlewares } from '../base-middlewares.ts';
import { FileIdentification, identifyFileFromDirEntry } from './file-type.ts';
import { FfsApplicationState } from '../application-state.ts';
import { StatResultSuccess } from '../files/file-tree.ts';

type ApiFile = Deno.DirEntry & FileIdentification & {
    date: Date;
};

type FileStat = {
    listingResult: Deno.DirEntry;
    fileTreeResult: StatResultSuccess;
};

export function registerDirectoryRoutes(router: Router<FfsApplicationState>) {
    router.get('/api/directory', baseMiddlewares(), ...protectedMiddlewares(), async (ctx) => {
        const fileTree = ctx.state.fileTree;
        const pathToCheck = ctx.request.url.searchParams.get('path');
        if (!pathToCheck) {
            ctx.response.status = HTTP_404_NOT_FOUND;
            return;
        }

        console.time('directory');
        const listing = await fileTree.listDirectory(pathToCheck);
        if (listing.type === 'none') {
            ctx.response.status = HTTP_404_NOT_FOUND;
            return;
        }

        console.timeLog('directory');
        const fileStats = await Promise.all(
            listing.files.map(async (x) => ({
                listingResult: x,
                fileTreeResult: await fileTree.stat(listing, x.name),
            })),
        );
        console.timeLog('directory');

        const relevantFileStats: FileStat[] = fileStats.filter((x) =>
            x.fileTreeResult.type === 'valid'
        ) as FileStat[];
        const identifiedFiles = relevantFileStats.map((x) => ({
            ...x.listingResult,
            ...identifyFileFromDirEntry(x.fileTreeResult.fullPath, x.listingResult),
            date: x.fileTreeResult.info.ctime || x.fileTreeResult.info.mtime || new Date(0),
        }));

        console.timeEnd('directory');
        ctx.response.body = identifiedFiles;
    });
}
