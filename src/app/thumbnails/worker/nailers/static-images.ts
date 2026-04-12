import { ensureDir } from '@std/fs/ensure-dir';
import { move } from '@std/fs/move';
import { dirname } from '@std/path/dirname';
import { getThumbnailPath, getThumbnailTempDir } from '../../../files/cache-folder.ts';
import { logger } from '../../../logging/loggers.ts';
import { ThumbnailRequest } from '../../types.ts';

export const acceptedFileExtensions = [
    '.png',
    '.jpg',
    '.jpeg',
    '.tiff',
    '.webp',
    '.gif',
    '.avif',
    '.bmp',
    '.ico',
    '.psd',
];

export async function createImageMagickThumbnail(
    thumbnail: ThumbnailRequest,
): Promise<string | null> {
    const outputPath = getThumbnailPath(thumbnail.filePath);
    const tempFile = await Deno.makeTempFile({
        prefix: 'ffs_imggen',
        dir: getThumbnailTempDir(),
        suffix: '.webp',
    });
    let append = '';
    if (thumbnail.filePath.toLocaleLowerCase().endsWith('.gif')) {
        append = '[0]'; // generate static image for GIFs
    }
    const command = new Deno.Command('convert', {
        args: [
            thumbnail.filePath + append,
            '-thumbnail',
            '128x128',
            '-quality',
            '60',
            tempFile,
        ],
    });
    let tempFileMoved = false;
    try {
        const result = await command.output();
        if (!result.success) {
            return null;
        }
        await ensureDir(dirname(outputPath));
        await move(tempFile, outputPath, { overwrite: true });
        tempFileMoved = true;
        logger.debug(
            'Generated thumbnail',
            outputPath,
        );
        return outputPath;
    } finally {
        if (!tempFileMoved) {
            await Deno.remove(tempFile).catch(() => {});
        }
    }
}
