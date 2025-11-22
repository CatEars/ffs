import { ThumbnailRequest } from './types.ts';
import { dirname, extname } from '@std/path';
import { createMp4Thumbnail } from './nailers/mp4.ts';
import { createImageMagickThumbnail } from './nailers/static-images.ts';
import { collectAsync } from '../utils/collect-async.ts';
import { logger } from '../logging/logger.ts';
import { getThumbnailPath } from '../files/cache-folder.ts';
import { existsSync } from '@std/fs/exists';

type ThumbnailType = 'image' | 'video';

type Thumbnailer = {
    extNames: string[];
    thumbnailType: ThumbnailType;
    handler: (thumbnail: ThumbnailRequest) => Promise<void>;
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

async function promoteThumbnail(request: ThumbnailRequest) {
    const outputPath = getThumbnailPath(request.filePath);
    const parentDir = dirname(request.filePath);
    const targetPath = getThumbnailPath(parentDir);
    await Deno.copyFile(outputPath, targetPath);
    logger.info('Promoting thumbnail for', outputPath, 'to directory', targetPath);
}

function findFileType(filePath: string) {
    const fileExt = extname(filePath);
    const matchingNailers = nailers.filter((x) => x.extNames.includes(fileExt));
    if (matchingNailers.length === 0) {
        return null;
    }

    return matchingNailers[0].thumbnailType;
}

export async function promoteThumbnailToParentFolderIfRelevant(
    request: ThumbnailRequest,
) {
    // If we created a video thumbnail and there are no other videos -> copy thumbnail to parent
    // Else if we created an image thumbnail and this is the only image -> copy thumbnail to parent

    const thumbnailType = findFileType(request.filePath);
    const sharedDir = dirname(request.filePath);
    const entries = await collectAsync(Deno.readDir(sharedDir));
    const types = entries.map((entry) => findFileType(entry.name));
    const numVideos = types.filter((x) => x === 'video').length;
    const numImages = types.filter((x) => x === 'image').length;

    const isOnlyVideo = thumbnailType === 'video' && numVideos === 1;
    const isOnlyImage = thumbnailType === 'image' && numImages === 1;
    if (isOnlyVideo || isOnlyImage) {
        await promoteThumbnail(request);
    }
}

export async function generateThumbnail(thumbnail: ThumbnailRequest) {
    const ext = extname(thumbnail.filePath);
    for (const nailer of nailers) {
        if (nailer.extNames.includes(ext)) {
            await nailer.handler(thumbnail);
            await promoteThumbnailToParentFolderIfRelevant(
                thumbnail,
            );

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
