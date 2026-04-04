import { relative } from '@std/path';
import { FileType, isImageFile, isSoundFile, isVideoFile } from '../../lib/file-type/file-type.ts';
import { getStoreRoot } from '../config.ts';

export type { FileType };

export type FileIdentification = {
    fileType: FileType;
    imageSrc: string;
    svgIconName: string;
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
            svgIconName: 'folder',
        };
    } else if (isVideoFile(fullPath)) {
        return {
            fileType: 'video',
            imageSrc,
            svgIconName: 'videocam',
        };
    } else if (isSoundFile(fullPath)) {
        return {
            fileType: 'sound',
            imageSrc,
            svgIconName: 'music_note',
        };
    } else if (isImageFile(fullPath)) {
        return {
            fileType: 'image',
            imageSrc,
            svgIconName: 'photo_camera',
        };
    } else {
        return {
            fileType: 'unidentified',
            imageSrc,
            svgIconName: 'description',
        };
    }
}
