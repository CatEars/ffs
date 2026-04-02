import { ThumbnailContext, ThumbnailResult } from './types.ts';

export interface ThumbnailProvider {
    handle(ctx: ThumbnailContext): Promise<ThumbnailResult>;
}
