import { ThumbnailResult } from './types.ts';

export interface ThumbnailProvider {
    handle(
        resolvedFullPath: string,
        isDirectory: boolean,
    ): Promise<ThumbnailResult>;
}
