import { ThumbnailProvider } from './thumbnail-provider.ts';
import { ThumbnailResult } from './types.ts';

export class ThumbnailProviderChain {
    private providers: ThumbnailProvider[] = [];

    prepend(provider: ThumbnailProvider): void {
        this.providers.unshift(provider);
    }

    append(provider: ThumbnailProvider): void {
        this.providers.push(provider);
    }

    async resolve(
        resolvedFullPath: string,
        isDirectory: boolean,
    ): Promise<ThumbnailResult> {
        for (const provider of this.providers) {
            const result = await provider.handle(resolvedFullPath, isDirectory);
            if (result.type === 'ThumbnailFound') {
                return result;
            }
        }
        return { type: 'ThumbnailNotFound' };
    }
}
