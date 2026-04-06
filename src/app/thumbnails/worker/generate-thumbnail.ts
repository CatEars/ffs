import { extname } from '@std/path';
import { thumbnailExists } from '../../files/cache-folder.ts';
import { ThumbnailRequest } from '../types.ts';
import { ffmpegTester, imageMagickTester } from './index.ts';
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

const ffmpegNailer: Thumbnailer = {
    extNames: acceptedVideoExtensions,
    thumbnailType: 'video',
    handler: createMp4Thumbnail,
};

const imageMagickNailer: Thumbnailer = {
    extNames: acceptedImageExtensions,
    thumbnailType: 'image',
    handler: createImageMagickThumbnail,
};

// LINK-FILE-EXTENSIONS
let nailers: Thumbnailer[] = [
    {
        extNames: [],
        thumbnailType: 'directory',
        handler: copyMostFitingThumbnailFromDirectory,
    },
];

let extNames: string[] = [];
function rebuildExtNames() {
    extNames = nailers.flatMap((x) => x.extNames);
}

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

export async function ensureNailersUpToDate() {
    let changed = false;
    const containsFfmpeg = nailers.some((elem) => elem.thumbnailType === 'video');
    const containsImageMagick = nailers.some((elem) => elem.thumbnailType === 'image');
    const ffmpegAvailable = await ffmpegTester.isAvailable();
    const imageMagickAvailable = await imageMagickTester.isAvailable();

    if (ffmpegAvailable && !containsFfmpeg) {
        nailers.push(ffmpegNailer);
        changed = true;
    } else if (!ffmpegAvailable && containsFfmpeg) {
        nailers = nailers.filter((x) => x.thumbnailType === 'video');
        changed = true;
    }

    if (imageMagickAvailable && !containsImageMagick) {
        nailers.push(imageMagickNailer);
        changed = true;
    } else if (!imageMagickAvailable && containsImageMagick) {
        nailers = nailers.filter((x) => x.thumbnailType === 'image');
        changed = true;
    }

    if (changed) {
        rebuildExtNames();
    }
}
