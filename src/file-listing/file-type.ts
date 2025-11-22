import { relative } from '@std/path';
import { canGenerateThumbnailFor } from '../thumbnails/generate-thumbnail.ts';
import { getStoreRoot } from '../config.ts';

export type FileType = 'video' | 'image' | 'sound' | 'directory' | 'unidentified';

export type FileIdentification = {
    fileType: FileType;
    imageSrc: string;
};

function isVideoFile(filename: string): boolean {
    return ['mp4', 'mv4'].some((x) => filename.endsWith(x));
}

function isSoundFile(filename: string): boolean {
    return ['mp3'].some((x) => filename.endsWith(x));
}

function isImageFile(filename: string): boolean {
    return ['png', 'jpg', 'jpeg', 'gif', 'tiff', 'webp', 'avif', 'bmp', 'ico'].some((x) =>
        filename.endsWith(x)
    );
}

export function identifyFileFromDirEntry(
    fullPath: string,
    entry: Deno.DirEntry,
): FileIdentification {
    const lowercaseName = entry.name.toLocaleLowerCase();
    const relativePath = relative(getStoreRoot(), fullPath);

    const imageSrc = canGenerateThumbnailFor(fullPath) ? `/api/thumbnail?path=${relativePath}` : '';
    if (entry.isDirectory) {
        return {
            fileType: 'directory',
            imageSrc: imageSrc || 'folder',
        };
    } else if (isVideoFile(lowercaseName)) {
        return {
            fileType: 'video',
            imageSrc: imageSrc || 'videocam',
        };
    } else if (isSoundFile(lowercaseName)) {
        return {
            fileType: 'sound',
            imageSrc: imageSrc || 'music_note',
        };
    } else if (isImageFile(lowercaseName)) {
        return {
            fileType: 'image',
            imageSrc: imageSrc || 'photo_camera',
        };
    } else {
        return {
            fileType: 'unidentified',
            imageSrc: imageSrc || 'description',
        };
    }
}
