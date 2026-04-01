import { Context } from '@oak/oak/context';
import { FfsApplicationState } from '../../application-state.ts';
import { ThumbnailProvider } from './thumbnail-provider.ts';

export class ThumbnailProviderChain {
    private providers: ThumbnailProvider[] = [];

    prepend(provider: ThumbnailProvider): void {
        this.providers.unshift(provider);
    }

    append(provider: ThumbnailProvider): void {
        this.providers.push(provider);
    }

    async resolve(
        ctx: Context<FfsApplicationState>,
        resolvedFullPath: string,
        isDirectory: boolean,
    ): Promise<void> {
        for (const provider of this.providers) {
            const handled = await provider.handle(ctx, resolvedFullPath, isDirectory);
            if (handled) {
                return;
            }
        }
    }
}
