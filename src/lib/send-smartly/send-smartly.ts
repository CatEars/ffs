import { Context } from '@oak/oak';
import { basename } from '@std/path/basename';
import { join } from '@std/path/join';
import { HTTP_400_BAD_REQUEST } from '../http/http-codes.ts';
import { setDownloadedFilename } from '../http/set-filename.ts';
import { Logger } from '../logger/logger.ts';
import { sendAsArchive } from '../send-as-archive/send-as-archive.ts';
import { sendDirectory } from '../send-directory/send-directory.ts';

export type SendSmartlyOptions = {
    root: string;
    logger?: Logger;
};

export async function sendFilesSmartly(
    ctx: Context,
    filePaths: string[],
    options: SendSmartlyOptions,
) {
    if (filePaths.length === 0) {
        ctx.response.status = HTTP_400_BAD_REQUEST;
        return;
    } else if (filePaths.length === 1) {
        const path = filePaths[0];
        const fullPath = join(options.root, path);
        const stat = await Deno.stat(fullPath);
        if (stat.isDirectory) {
            sendDirectory(ctx, path, options);
        } else if (stat.isFile) {
            setDownloadedFilename(ctx, basename(path));
            await ctx.send({
                root: options.root,
                path,
                gzip: true,
            });
        } else {
            ctx.response.status = HTTP_400_BAD_REQUEST;
            return;
        }
    } else {
        sendAsArchive(ctx, filePaths, options);
    }
}
