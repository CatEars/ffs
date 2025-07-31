import { canGenerateThumbnailFor } from "../thumbnails/generate-thumbnail.ts";

export type FileType = 'video' | 'image' | 'sound' | 'directory' | 'unidentified'

export type FileIdentification = {
    fileType: FileType;
    imageSrc: string;
}

function isVideoFile(filename: string): boolean {
    return ['mp4', 'mv4'].some(x => filename.endsWith(x));
}

function isSoundFile(filename: string): boolean {
    return ['mp3'].some(x => filename.endsWith(x));
}

function isImageFile(filename: string): boolean {
    return ['png', 'jpg', 'jpeg', 'gif', 'tiff', 'webp', 'avif', 'bmp', 'ico'].some(x => filename.endsWith(x));
}

export function identifyFileFromDirEntry(fullPath: string, entry: Deno.DirEntry): FileIdentification {
    if (entry.isDirectory) {
        return {
            fileType: 'directory',
            imageSrc: '/static/svg/folder.svg'
        }
    }
    const lowercaseName = entry.name.toLocaleLowerCase();
    const imageSrc = canGenerateThumbnailFor(fullPath) ? `/api/thumbnail?path=${fullPath}` : ''
    if (isVideoFile(lowercaseName)) {
        return {
            fileType: 'video',
            imageSrc: imageSrc || '/static/svg/videocam.svg'
        }
    } else if (isSoundFile(lowercaseName)) {
        return {
            fileType: 'sound',
            imageSrc: imageSrc || '/static/svg/music_note.svg'
        }
    } else if (isImageFile(lowercaseName)) {
        return {
            fileType: 'image',
            imageSrc: imageSrc || '/static/svg/photo_camera.svg'
        }
    } else {
        return {    
            fileType: 'unidentified',
            imageSrc: imageSrc || '/static/svg/description.svg'
        }
    }
}