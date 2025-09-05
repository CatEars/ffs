import { ThumbnailRequest } from '../types.ts';
import { logger } from '../../logging/logger.ts';
import { ensureDir } from '@std/fs/ensure-dir';
import { dirname } from '@std/path/dirname';
import { getThumbnailPath } from '../../files/cache-folder.ts';
import { move } from '@std/fs';
import { getCacheRoot } from '../../config.ts';

type Mp4Info = {
    duration: number;
    height: number;
    width: number;
};

async function getMp4Duration(thumbnail: ThumbnailRequest): Promise<Mp4Info> {
    const command = new Deno.Command('ffprobe', {
        args: [
            '-v',
            'error',
            '-show_entries',
            'format=duration',
            '-show_entries',
            'stream=width,height',
            '-of',
            'default=noprint_wrappers=1:nokey=1',
            thumbnail.filePath,
        ],
    });
    const result = await command.output();
    const text = new TextDecoder().decode(result.stdout);
    const [width, height, dur] = text.split('\n');
    return {
        duration: parseFloat(dur),
        height: parseInt(height),
        width: parseInt(width),
    };
}

export async function createMp4Thumbnail(thumbnail: ThumbnailRequest) {
    const mp4Info = await getMp4Duration(thumbnail);
    const position = (mp4Info.duration * 0.45) || 30;
    const outputPath = getThumbnailPath(thumbnail.filePath);
    const tempFile = await Deno.makeTempFile({
        prefix: 'ffs_mp4gen',
        dir: getCacheRoot(),
        suffix: '.webp',
    });
    ensureDir(dirname(outputPath));
    const thumbnailFilter = mp4Info.height * 1.3 > mp4Info.width
        ? 'scale=320:480'
        : mp4Info.height > mp4Info.width
        ? 'scale=320:320'
        : 'scale=320:240';
    const command = new Deno.Command('ffmpeg', {
        args: [
            '-ss',
            `${position}`,
            '-i',
            thumbnail.filePath,
            '-vf',
            thumbnailFilter,
            '-frames:v',
            '1',
            '-vsync',
            'vfr',
            '-err_detect',
            'ignore_err',
            '-y',
            tempFile,
        ],
    });
    const result = await command.output();
    if (!result.success) {
        logger.debug('ffmpeg problems', new TextDecoder().decode(result.stderr));
        await Deno.remove(tempFile);
        return;
    }
    await move(tempFile, outputPath, { overwrite: true });
    logger.debug(
        'Generated thumbnail',
        outputPath,
    );
}
