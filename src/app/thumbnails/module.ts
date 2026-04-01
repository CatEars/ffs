import { startThumbnailScanning } from '../files/cache-folder.ts';
import {
    areThumbnailsAvailable,
    startThumbnailBackgroundProcess,
} from './index.ts';
import { GeneratedThumbnailProvider } from '../api/thumbnail/providers/generated-thumbnail-provider.ts';
import { ThumbnailProviderChain } from '../api/thumbnail/thumbnail-provider-chain.ts';

export function isAvailable(): boolean {
    return areThumbnailsAvailable();
}

export function activate(chain: ThumbnailProviderChain): void {
    chain.prepend(new GeneratedThumbnailProvider());
}

export async function startBackgroundTasks(): Promise<void> {
    startThumbnailBackgroundProcess();
    await startThumbnailScanning();
}
