import { ensureDir } from '@std/fs/ensure-dir';
import { move } from '@std/fs/move';
import { dirname } from '@std/path/dirname';
import { getThumbnailPath, getThumbnailTempDir } from '../../../files/cache-folder.ts';
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

export async function createAudioThumbnail(
    thumbnail: ThumbnailRequest,
): Promise<string | null> {
    const outputPath = getThumbnailPath(thumbnail.filePath);

    // Extract embedded album art from the audio file using FFmpeg.
    const tempArtFile = await Deno.makeTempFile({
        prefix: 'ffs_audioart',
        dir: getThumbnailTempDir(),
        suffix: '.jpg',
    });

    const extractCommand = new Deno.Command('ffmpeg', {
        args: [
            '-i',
            thumbnail.filePath,
            '-map',
            '0:v:0',
            '-c:v',
            'copy',
            '-y',
            tempArtFile,
        ],
    });

    const extractResult = await extractCommand.output();
    if (!extractResult.success) {
        logger.debug('No album art found in', thumbnail.filePath);
        await Deno.remove(tempArtFile);
        return null;
    }

    // Verify the extracted file has content.
    const artStat = await Deno.stat(tempArtFile);
    if (artStat.size === 0) {
        logger.debug('Empty album art extracted from', thumbnail.filePath);
        await Deno.remove(tempArtFile);
        return null;
    }

    // Use ImageMagick to create the thumbnail from the extracted album art.
    const tempThumbFile = await Deno.makeTempFile({
        prefix: 'ffs_audiogen',
        dir: getThumbnailTempDir(),
        suffix: '.webp',
    });

    const convertCommand = new Deno.Command('convert', {
        args: [
            tempArtFile,
            '-thumbnail',
            '128x128',
            '-quality',
            '60',
            tempThumbFile,
        ],
    });

    const convertResult = await convertCommand.output();
    await Deno.remove(tempArtFile);

    if (!convertResult.success) {
        logger.debug(
            'Failed to convert album art to thumbnail for',
            thumbnail.filePath,
            new TextDecoder().decode(convertResult.stderr),
        );
        await Deno.remove(tempThumbFile);
        return null;
    }

    await ensureDir(dirname(outputPath));
    await move(tempThumbFile, outputPath, { overwrite: true });
    logger.debug('Generated thumbnail', outputPath);
    return outputPath;
}
