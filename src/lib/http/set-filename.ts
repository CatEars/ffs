import { Context } from '@oak/oak';

export function setDownloadedFilename(ctx: Context, filename: string) {
    ctx.response.headers.set(
        'Content-Disposition',
        `attachment; filename="${filename}"`,
    );
}
