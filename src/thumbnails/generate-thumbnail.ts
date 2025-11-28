import { ThumbnailRequest } from './types.ts';
import { extname } from '@std/path';
import {
    acceptedFileExtensions as acceptedVideoExtensions,
    createMp4Thumbnail,
} from './nailers/mp4.ts';
import {
    acceptedFileExtensions as acceptedImageExtensions,
    createImageMagickThumbnail,
} from './nailers/static-images.ts';
import { thumbnailExists } from '../files/cache-folder.ts';
import { copyMostFitingThumbnailFromDirectory } from './nailers/directory.ts';

type ThumbnailType = 'image' | 'video' | 'directory';

type Thumbnailer = {
    extNames: string[];
    thumbnailType: ThumbnailType;
    handler: (thumbnail: ThumbnailRequest) => Promise<void>;
};

// LINK-FILE-EXTENSIONS
const nailers: Thumbnailer[] = [
    {
        extNames: acceptedVideoExtensions,
        thumbnailType: 'video',
        handler: createMp4Thumbnail,
    },
    {
        extNames: acceptedImageExtensions,
        thumbnailType: 'image',
        handler: createImageMagickThumbnail,
    },
    {
        extNames: [],
        thumbnailType: 'directory',
        handler: copyMostFitingThumbnailFromDirectory,
    },
];

const extNames = nailers.flatMap((x) => x.extNames);

export async function generateThumbnail(thumbnail: ThumbnailRequest) {
    const ext = extname(thumbnail.filePath);
    for (const nailer of nailers) {
        if (
            thumbnail.isFile && nailer.thumbnailType !== 'directory' &&
            nailer.extNames.includes(ext)
        ) {
            await nailer.handler(thumbnail);
            return;
        } else if (thumbnail.isDirectory && nailer.thumbnailType === 'directory') {
            await nailer.handler(thumbnail);
            return;
        }
    }
}

export function canGenerateThumbnailFor(filePath: string) {
    if (extNames.includes(extname(filePath))) {
        return true;
    }
    return thumbnailExists(filePath);
}
