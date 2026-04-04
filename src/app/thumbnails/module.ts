import { startThumbnailScanning } from '../files/cache-folder.ts';
import { areThumbnailsAvailable, startThumbnailBackgroundProcess } from './index.ts';

export function isAvailable(): boolean {
    return areThumbnailsAvailable();
}

export function activate(): void {
    startThumbnailBackgroundProcess();
}

export async function startBackgroundTasks(): Promise<void> {
    await startThumbnailScanning();
}
