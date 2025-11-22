import { ThumbnailRequest } from './types.ts';
import { basename, dirname, extname, join } from '@std/path';
import { createMp4Thumbnail } from './nailers/mp4.ts';
import { createImageMagickThumbnail } from './nailers/static-images.ts';
import { collectAsync } from '../utils/collect-async.ts';
import { logger } from '../logging/logger.ts';
import { getThumbnailPath } from '../files/cache-folder.ts';
import { existsSync } from '@std/fs/exists';

type ThumbnailResult = {
    outputPath: string;
};

type ThumbnailType = 'image' | 'video';

type Thumbnailer = {
    extNames: string[];
    thumbnailType: ThumbnailType;
    handler: (thumbnail: ThumbnailRequest) => Promise<ThumbnailResult | undefined>;
};

// LINK-FILE-EXTENSIONS
const nailers: Thumbnailer[] = [
    {
        extNames: [
            '.mp4',
            '.m4v',
            '.mov',
            '.avi',
            '.webm',
            '.mkv',
            '.mpg',
        ],
        thumbnailType: 'video',
        handler: createMp4Thumbnail,
    },
    {
        extNames: [
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
        ],
        thumbnailType: 'image',
        handler: createImageMagickThumbnail,
    },
];

const extNames = nailers.flatMap((x) => x.extNames);

async function promoteThumbnail(request: ThumbnailRequest, result: ThumbnailResult) {
    const parentDir = dirname(request.filePath);
    const targetPath = getThumbnailPath(parentDir);
    await Deno.copyFile(result.outputPath, targetPath);
    logger.info('Promoting thumbnail for', result.outputPath, 'to directory', targetPath);
}

async function promoteThumbnailToParentFolderIfRelevant(
    request: ThumbnailRequest,
    thumbnailType: ThumbnailType,
    result: ThumbnailResult,
) {
    // If we created a video thumbnail and there are no other videos -> copy thumbnail to parent
    // Else if we created an image thumbnail and this is the only image -> copy thumbnail to parent

    const sharedDir = dirname(request.filePath);
    const entries = await collectAsync(Deno.readDir(sharedDir));
    const extnames = entries.map((entry) => extname(entry.name));
    const types = extnames.map((extname) =>
        (nailers.filter((nailer) => nailer.extNames.includes(extname))[0] || {}).thumbnailType
    );
    const numVideos = types.filter((x) => x === 'video').length;
    const numImages = types.filter((x) => x === 'image').length;

    const isOnlyVideo = thumbnailType === 'video' && numVideos === 1;
    const isOnlyImage = thumbnailType === 'image' && numImages === 1;
    if (isOnlyVideo || isOnlyImage) {
        await promoteThumbnail(request, result);
    }
}

export async function generateThumbnail(thumbnail: ThumbnailRequest) {
    const ext = extname(thumbnail.filePath);
    for (const nailer of nailers) {
        if (nailer.extNames.includes(ext)) {
            const result = await nailer.handler(thumbnail);
            if (result) {
                await promoteThumbnailToParentFolderIfRelevant(
                    thumbnail,
                    nailer.thumbnailType,
                    result,
                );
            }
            return;
        }
    }
}

export function canGenerateThumbnailFor(filePath: string) {
    // Files with a matching extension we can do, but for directories we MAY only create thumbnails
    // return true for any non-matching file that has a .webp
    if (extNames.includes(extname(filePath))) {
        return true;
    }
    const thumbnailPath = getThumbnailPath(filePath);
    return existsSync(thumbnailPath);
}
