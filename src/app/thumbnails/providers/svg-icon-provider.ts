import { extname } from '@std/path/extname';
import { join } from '@std/path/join';
import { ThumbnailProvider } from '../thumbnail-provider.ts';
import { ThumbnailContext, ThumbnailResult } from '../types.ts';

type SvgIconName = 'folder' | 'videocam' | 'music_note' | 'photo_camera' | 'description';

const videoExtensions = ['.mp4', '.mv4', '.m4v'];
const soundExtensions = ['.mp3'];
const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.tiff', '.webp', '.avif', '.bmp', '.ico'];

function resolveIconName(resolvedFullPath: string, isDirectory: boolean): SvgIconName {
    if (isDirectory) {
        return 'folder';
    }
    const ext = extname(resolvedFullPath).toLowerCase();
    if (videoExtensions.includes(ext)) {
        return 'videocam';
    }
    if (soundExtensions.includes(ext)) {
        return 'music_note';
    }
    if (imageExtensions.includes(ext)) {
        return 'photo_camera';
    }
    return 'description';
}

const svgDir = join(import.meta.dirname!, '../../website/static/svg');

export class SvgIconProvider implements ThumbnailProvider {
    handle({ resolvedFullPath, isDirectory }: ThumbnailContext): Promise<ThumbnailResult> {
        const iconName = resolveIconName(resolvedFullPath, isDirectory);
        return Promise.resolve({ type: 'thumbnail-found', root: svgDir, path: `${iconName}.svg` });
    }
}
