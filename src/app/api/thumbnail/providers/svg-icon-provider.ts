import { extname } from '@std/path/extname';
import { join } from '@std/path/join';
import { Context } from '@oak/oak/context';
import { HTTP_500_INTERNAL_SERVER_ERROR } from '../../../../lib/http/http-codes.ts';
import { FfsApplicationState } from '../../../application-state.ts';
import { logger } from '../../../logging/loggers.ts';
import { ThumbnailProvider } from '../thumbnail-provider.ts';

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

const svgDir = join(import.meta.dirname!, '../../../website/static/svg');

export class SvgIconProvider implements ThumbnailProvider {
    async handle(
        ctx: Context<FfsApplicationState>,
        resolvedFullPath: string,
        isDirectory: boolean,
    ): Promise<boolean> {
        const iconName = resolveIconName(resolvedFullPath, isDirectory);
        const svgPath = join(svgDir, `${iconName}.svg`);
        try {
            const svgContent = await Deno.readTextFile(svgPath);
            ctx.response.headers.set('Content-Type', 'image/svg+xml');
            ctx.response.body = svgContent;
        } catch (err) {
            logger.error(`Failed to read SVG icon file '${svgPath}':`, err);
            ctx.response.status = HTTP_500_INTERNAL_SERVER_ERROR;
        }
        return true;
    }
}
