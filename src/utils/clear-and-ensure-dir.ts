import { ensureDir } from '@std/fs/ensure-dir';

export async function clearAndEnsureDirectoryExists(dirPath: string) {
    await Deno.remove(dirPath, { recursive: true }).catch((err) => {
        if (!(err instanceof Deno.errors.NotFound)) {
            throw err;
        }
    });
    await ensureDir(dirPath);
}
