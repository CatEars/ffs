import { ThumbnailRequest } from './types.ts';
import { extname } from '@std/path';
import { createMp4Thumbnail } from './nailers/mp4.ts';
import { createImageMagickThumbnail } from './nailers/static-images.ts';

type Thumbnailer = {
    extNames: string[];
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
        handler: createImageMagickThumbnail,
    },
];

const extNames = nailers.flatMap((x) => x.extNames);

export async function generateThumbnail(thumbnail: ThumbnailRequest) {
    const ext = extname(thumbnail.filePath);
    for (const nailer of nailers) {
        if (nailer.extNames.includes(ext)) {
            await nailer.handler(thumbnail);
            return;
        }
    }
}

export function canGenerateThumbnailFor(filePath: string) {
    return extNames.includes(extname(filePath));
}
