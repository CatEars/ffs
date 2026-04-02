import { extname } from '@std/path/extname';
import { join } from '@std/path/join';
import { logger } from '../../logging/loggers.ts';
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
    async handle({ resolvedFullPath, isDirectory }: ThumbnailContext): Promise<ThumbnailResult> {
        const iconName = resolveIconName(resolvedFullPath, isDirectory);
        const svgPath = join(svgDir, `${iconName}.svg`);
        try {
            const body = await Deno.readTextFile(svgPath);
            return { type: 'ThumbnailFound', contentType: 'image/svg+xml', body };
        } catch (err) {
            logger.error(`Failed to read SVG icon file '${svgPath}':`, err);
            return { type: 'ThumbnailNotFound' };
        }
    }
}
