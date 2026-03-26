import { Context } from '@oak/oak';
import { join } from '@std/path/join';
import { resolve } from '@std/path/resolve';
import { basename } from 'node:path';
import { logger } from '../../app/logging/loggers.ts';
import { HTTP_400_BAD_REQUEST } from '../http/http-codes.ts';
import { setDownloadedFilename } from '../http/set-filename.ts';
import { streamDirectoryAsTarGzip } from './directory-stream.ts';

export type SendDirectoryOptions = {
    root: string;
};

export function sendDirectory(ctx: Context, path: string, options: SendDirectoryOptions) {
    const resolvedPath = resolve(join(options.root, path));
    if (!resolvedPath.startsWith(resolve(options.root))) {
        ctx.response.status = HTTP_400_BAD_REQUEST;
        return;
    }

    logger.info('sending directory', resolvedPath);
    setDownloadedFilename(ctx, basename(path) + '.tar.gz');
    ctx.response.type = 'application/gzip';
    ctx.response.body = streamDirectoryAsTarGzip(resolvedPath);
}
