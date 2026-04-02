import { ThumbnailProvider } from './thumbnail-provider.ts';
import { ThumbnailContext, ThumbnailResult } from './types.ts';

export class ThumbnailProviderChain {
    private providers: ThumbnailProvider[] = [];

    prepend(provider: ThumbnailProvider): void {
        this.providers.unshift(provider);
    }

    append(provider: ThumbnailProvider): void {
        this.providers.push(provider);
    }

    async resolve(ctx: ThumbnailContext): Promise<ThumbnailResult> {
        for (const provider of this.providers) {
            const result = await provider.handle(ctx);
            if (result.type === 'ThumbnailFound') {
                return result;
            }
        }
        return { type: 'ThumbnailNotFound' };
    }
}
