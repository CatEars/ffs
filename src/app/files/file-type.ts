import { relative } from '@std/path';
import { getStoreRoot } from '../config.ts';
import { FileType, isImageFile, isSoundFile, isVideoFile } from '../../lib/file-type/file-type.ts';

export type { FileType };

export type FileIdentification = {
    fileType: FileType;
    imageSrc: string;
};

export function identifyFileFromDirEntry(
    fullPath: string,
    entry: Deno.DirEntry,
): FileIdentification {
    const relativePath = relative(getStoreRoot(), fullPath);
    const imageSrc = `/api/thumbnail?path=${encodeURIComponent(relativePath)}`;

    if (entry.isDirectory) {
        return {
            fileType: 'directory',
            imageSrc,
        };
    } else if (isVideoFile(fullPath)) {
        return {
            fileType: 'video',
            imageSrc,
        };
    } else if (isSoundFile(fullPath)) {
        return {
            fileType: 'sound',
            imageSrc,
        };
    } else if (isImageFile(fullPath)) {
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
