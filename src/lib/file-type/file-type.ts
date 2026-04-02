import { extname } from '@std/path/extname';

export type FileType = 'video' | 'image' | 'sound' | 'directory' | 'unidentified';

export const videoExtensions = ['.mp4', '.mv4', '.m4v'];
export const soundExtensions = ['.mp3'];
export const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.tiff', '.webp', '.avif', '.bmp', '.ico'];

export function isVideoFile(filePath: string): boolean {
    return videoExtensions.includes(extname(filePath).toLowerCase());
}

export function isSoundFile(filePath: string): boolean {
    return soundExtensions.includes(extname(filePath).toLowerCase());
}

export function isImageFile(filePath: string): boolean {
    return imageExtensions.includes(extname(filePath).toLowerCase());
}
