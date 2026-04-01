import { relative } from '@std/path';
import { getStoreRoot } from '../config.ts';

export type FileType = 'video' | 'image' | 'sound' | 'directory' | 'unidentified';

export type FileIdentification = {
    fileType: FileType;
    imageSrc: string;
};

function isVideoFile(filename: string): boolean {
    return ['mp4', 'mv4', 'm4v'].some((x) => filename.endsWith(x));
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
    const imageSrc = `/api/thumbnail?path=${encodeURIComponent(relativePath)}`;

    if (entry.isDirectory) {
        return {
            fileType: 'directory',
            imageSrc,
        };
    } else if (isVideoFile(lowercaseName)) {
        return {
            fileType: 'video',
            imageSrc,
        };
    } else if (isSoundFile(lowercaseName)) {
        return {
            fileType: 'sound',
            imageSrc,
        };
    } else if (isImageFile(lowercaseName)) {
        return {
            fileType: 'image',
            imageSrc,
        };
    } else {
        return {
            fileType: 'unidentified',
            imageSrc,
        };
    }
}
