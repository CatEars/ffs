import { ensureDir } from '@std/fs/ensure-dir';
import { move } from '@std/fs/move';
import { dirname } from '@std/path/dirname';
import { join } from '@std/path/join';
import {
    getThumbnailPath,
    getThumbnailTempDir,
    thumbnailExists,
} from '../../../files/cache-folder.ts';
import { logger } from '../../../logging/loggers.ts';
import { ThumbnailRequest } from '../../types.ts';

export const acceptedFileExtensions = [
    '.mp3',
    '.wav',
    '.ogg',
    '.flac',
    '.aac',
    '.m4a',
    '.opus',
    '.wma',
    '.ape',
];

const folderArtNames = ['cover', 'folder', 'albumart', 'album', 'front', 'artwork'];
const folderArtExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

async function findFolderArt(dir: string): Promise<string | null> {
    for (const name of folderArtNames) {
        for (const ext of folderArtExtensions) {
            const candidate = join(dir, name + ext);
            try {
                const stat = await Deno.stat(candidate);
                if (stat.isFile) {
                    return candidate;
                }
            } catch {
                // file does not exist, try next
            }
        }
    }
    return null;
}

async function convertToThumbnail(artFile: string, outputPath: string): Promise<boolean> {
    const tempThumbFile = await Deno.makeTempFile({
        prefix: 'ffs_audiogen',
        dir: getThumbnailTempDir(),
        suffix: '.webp',
    });

    const convertCommand = new Deno.Command('convert', {
        args: [artFile, '-thumbnail', '128x128', '-quality', '60', tempThumbFile],
    });

    let tempThumbFileMoved = false;
    try {
        const convertResult = await convertCommand.output();
        if (!convertResult.success) {
            return false;
        }

        await ensureDir(dirname(outputPath));
        await move(tempThumbFile, outputPath, { overwrite: true });
        tempThumbFileMoved = true;
        return true;
    } finally {
        if (!tempThumbFileMoved) {
            await Deno.remove(tempThumbFile).catch(() => {});
        }
    }
}

async function promoteToParentDir(outputPath: string, parentDir: string): Promise<void> {
    if (thumbnailExists(parentDir)) {
        return;
    }
    const parentThumbnailPath = getThumbnailPath(parentDir);
    const tempPromotedFile = await Deno.makeTempFile({
        prefix: 'ffs_audiodir',
        dir: getThumbnailTempDir(),
        suffix: '.webp',
    });
    try {
        await Deno.copyFile(outputPath, tempPromotedFile);
        await ensureDir(dirname(parentThumbnailPath));
        await move(tempPromotedFile, parentThumbnailPath, { overwrite: true });
    } catch {
        await Deno.remove(tempPromotedFile).catch(() => {});
    }
}

async function finalizeThumbnail(outputPath: string, parentDir: string): Promise<string> {
    logger.debug('Generated thumbnail', outputPath);
    await promoteToParentDir(outputPath, parentDir);
    return outputPath;
}

export async function createAudioThumbnail(
    thumbnail: ThumbnailRequest,
): Promise<string | null> {
    const outputPath = getThumbnailPath(thumbnail.filePath);
    const parentDir = dirname(thumbnail.filePath);

    // Prefer album art file in the same folder over embedded art.
    const folderArt = await findFolderArt(parentDir);
    if (folderArt !== null) {
        if (await convertToThumbnail(folderArt, outputPath)) {
            return finalizeThumbnail(outputPath, parentDir);
        }
    }

    // Fall back to extracting embedded album art via FFmpeg.
    const tempArtFile = await Deno.makeTempFile({
        prefix: 'ffs_audioart',
        dir: getThumbnailTempDir(),
        suffix: '.jpg',
    });

    try {
        const extractCommand = new Deno.Command('ffmpeg', {
            args: ['-i', thumbnail.filePath, '-map', '0:v:0', '-c:v', 'copy', '-y', tempArtFile],
        });

        const extractResult = await extractCommand.output();
        if (!extractResult.success) {
            return null;
        }

        const artStat = await Deno.stat(tempArtFile);
        if (artStat.size === 0) {
            return null;
        }

        const success = await convertToThumbnail(tempArtFile, outputPath);
        if (!success) {
            return null;
        }

        return finalizeThumbnail(outputPath, parentDir);
    } finally {
        await Deno.remove(tempArtFile).catch(() => {});
    }
}
