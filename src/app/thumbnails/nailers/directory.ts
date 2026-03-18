import { getThumbnailPath, getThumbnailTempDir, thumbnailExists } from '../../files/cache-folder.ts';
import { ThumbnailRequest } from '../types.ts';
import { logger } from '../../logging/logger.ts';
import { extname } from '@std/path/extname';
import { collectAsync } from '../../utils/collect-async.ts';
import { acceptedFileExtensions as acceptedImageExtensions } from './static-images.ts';
import { acceptedFileExtensions as acceptedVideoExtensions } from './mp4.ts';
import { join } from '@std/path/join';
import { ensureDir } from '@std/fs/ensure-dir';
import { dirname } from '@std/path/dirname';
import { move } from '@std/fs/move';

async function promoteThumbnail(request: ThumbnailRequest, fileToCopy: string) {
    const targetPath = getThumbnailPath(request.filePath);
    const sourcePath = getThumbnailPath(join(request.filePath, fileToCopy));
    const tempFile = await Deno.makeTempFile({
        prefix: 'ffs_dirgen',
        dir: getThumbnailTempDir(),
        suffix: '.webp',
    });
    try {
        await Deno.copyFile(sourcePath, tempFile);
    } catch (err) {
        await Deno.remove(tempFile);
        throw err;
    }
    await ensureDir(dirname(targetPath));
    await move(tempFile, targetPath, { overwrite: true });
    logger.info('Promoting thumbnail for', sourcePath, 'to directory', targetPath);
}

function findFileType(filePath: string) {
    const fileExt = extname(filePath);
    const imageExts = acceptedImageExtensions;
    const videoExts = acceptedVideoExtensions;
    if (imageExts.includes(fileExt)) {
        return 'image';
    } else if (videoExts.includes(fileExt)) {
        return 'video';
    } else {
        return 'unknown';
    }
}

export async function copyMostFitingThumbnailFromDirectory(
    request: ThumbnailRequest,
): Promise<void> {
    // If we created a video thumbnail and there are no other videos -> copy thumbnail to parent
    // Else if we created an image thumbnail and this is the only image -> copy thumbnail to parent

    const entries = await collectAsync(Deno.readDir(request.filePath));
    const entriesWithThumbnails = entries.filter((x) =>
        thumbnailExists(join(request.filePath, x.name))
    );
    const videos = entriesWithThumbnails.filter((entry) => findFileType(entry.name) === 'video');
    const images = entriesWithThumbnails.filter((entry) => findFileType(entry.name) === 'image');

    if (videos.length === 1) {
        await promoteThumbnail(request, videos[0].name);
    } else if (images.length === 1) {
        await promoteThumbnail(request, images[0].name);
    }
}
