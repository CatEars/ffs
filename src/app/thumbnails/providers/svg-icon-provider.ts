import { join } from '@std/path/join';
import { isImageFile, isSoundFile, isVideoFile } from '../../../lib/file-type/file-type.ts';
import { ThumbnailProvider } from '../thumbnail-provider.ts';
import { ThumbnailContext, ThumbnailResult } from '../types.ts';

type SvgIconName = 'folder' | 'videocam' | 'music_note' | 'photo_camera' | 'description';

function resolveIconName(resolvedFullPath: string, isDirectory: boolean): SvgIconName {
    if (isDirectory) {
        return 'folder';
    }
    if (isVideoFile(resolvedFullPath)) {
        return 'videocam';
    }
    if (isSoundFile(resolvedFullPath)) {
        return 'music_note';
    }
    if (isImageFile(resolvedFullPath)) {
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
