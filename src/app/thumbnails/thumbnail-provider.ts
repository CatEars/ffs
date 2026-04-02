import { Context } from '@oak/oak/context';
import { FfsApplicationState } from '../application-state.ts';

export interface ThumbnailProvider {
    handle(
        ctx: Context<FfsApplicationState>,
        resolvedFullPath: string,
        isDirectory: boolean,
    ): Promise<boolean>;
}
