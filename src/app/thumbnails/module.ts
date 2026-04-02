import { startThumbnailScanning } from '../files/cache-folder.ts';
import {
    areThumbnailsAvailable,
    startThumbnailBackgroundProcess,
} from './index.ts';
import { GeneratedThumbnailProvider } from './providers/generated-thumbnail-provider.ts';
import { SvgIconProvider } from './providers/svg-icon-provider.ts';
import { ThumbnailProviderChain } from './thumbnail-provider-chain.ts';

export const thumbnailProviderChain = new ThumbnailProviderChain();
thumbnailProviderChain.append(new SvgIconProvider());

export function isAvailable(): boolean {
    return areThumbnailsAvailable();
}

export function activate(): void {
    thumbnailProviderChain.prepend(new GeneratedThumbnailProvider());
}

export async function startBackgroundTasks(): Promise<void> {
    startThumbnailBackgroundProcess();
    await startThumbnailScanning();
}
