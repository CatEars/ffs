import { Router } from '@oak/oak/router';
import { HTTP_404_NOT_FOUND } from '../../../lib/http/http-codes.ts';
import { FfsApplicationState } from '../../application-state.ts';
import { baseMiddlewares, protectedMiddlewares } from '../../base-middlewares.ts';
import { getDiskUsageQuicklyOrNull } from '../../disk-usage/worker/index.ts';
import { FileIdentification, identifyFileFromDirEntry } from '../../files/file-type.ts';

type ApiFile = Deno.DirEntry & FileIdentification & {
    date: Date;
    size?: number;
};

export function register(router: Router<FfsApplicationState>) {
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
        const diskUsageRequests: Promise<number | null>[] = [];
        const dirIndices: number[] = [];

        for (const listingResult of listing.files) {
            const statResult = await fileTree.stat(listing, listingResult.name);
            if (statResult.type === 'valid') {
                const date = statResult.info.mtime || statResult.info.ctime || new Date(0);
                const resultingFile: ApiFile = {
                    ...listingResult,
                    ...identifyFileFromDirEntry(statResult.fullPath, listingResult),
                    date,
                    size: listingResult.isFile ? (statResult.info.size ?? 0) : undefined,
                };
                resultingFiles.push(resultingFile);
                if (listingResult.isDirectory) {
                    dirIndices.push(resultingFiles.length - 1);
                    diskUsageRequests.push(getDiskUsageQuicklyOrNull(statResult.fullPath));
                }
            }
        }

        // Resolve all disk-usage requests in parallel; each has an ultra-short
        // internal timeout so this does not materially delay the response.
        const diskUsageResults = await Promise.all(diskUsageRequests);
        for (let i = 0; i < dirIndices.length; i++) {
            const sizeBytes = diskUsageResults[i];
            if (sizeBytes !== null) {
                resultingFiles[dirIndices[i]].size = sizeBytes;
            }
        }

        ctx.response.body = resultingFiles;
    });
}
