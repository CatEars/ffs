import { statfs } from 'node:fs/promises';

export async function availableDiskBytes(path: string): Promise<number> {
    const stats = await statfs(path);
    return Number(BigInt(stats.bavail) * BigInt(stats.bsize));
}
