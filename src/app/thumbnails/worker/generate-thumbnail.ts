import { extname } from '@std/path';
import { thumbnailExists } from '../../files/cache-folder.ts';
import { ThumbnailRequest } from '../types.ts';
import { copyMostFitingThumbnailFromDirectory } from './nailers/directory.ts';
import {
    acceptedFileExtensions as acceptedVideoExtensions,
    createMp4Thumbnail,
} from './nailers/mp4.ts';
import {
    acceptedFileExtensions as acceptedImageExtensions,
    createImageMagickThumbnail,
} from './nailers/static-images.ts';

type ThumbnailType = 'image' | 'video' | 'directory';

type Thumbnailer = {
    extNames: string[];
    thumbnailType: ThumbnailType;
    handler: (thumbnail: ThumbnailRequest) => Promise<string | null>;
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

export async function generateThumbnail(thumbnail: ThumbnailRequest): Promise<string | null> {
    const ext = extname(thumbnail.filePath);
    const stat = await Deno.stat(thumbnail.filePath);
    for (const nailer of nailers) {
        if (
            stat.isFile && nailer.thumbnailType !== 'directory' &&
            nailer.extNames.includes(ext)
        ) {
            return await nailer.handler(thumbnail);
        } else if (stat.isDirectory && nailer.thumbnailType === 'directory') {
            return await nailer.handler(thumbnail);
        }
    }
    return null;
}

export function canGenerateThumbnailFor(filePath: string) {
    if (extNames.includes(extname(filePath))) {
        return true;
    }
    return thumbnailExists(filePath);
}
