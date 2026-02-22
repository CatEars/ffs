import { decodeBase64Url, encodeBase64Url } from '@std/encoding/base64url';
import type { DecodedShare, ShareContext, ShareLinkScheme } from './share-link-scheme.ts';

const MAX_PATHS_LENGTH = 1250;
const decoder = new TextDecoder();

export class RawPathsShareLinkScheme implements ShareLinkScheme {
    schemeId(): string {
        return 'raw-paths';
    }

    isAvailable(ctx: ShareContext): Promise<boolean> {
        return Promise.resolve(JSON.stringify(ctx.paths).length <= MAX_PATHS_LENGTH);
    }

    createCode(ctx: ShareContext): Promise<string> {
        return Promise.resolve(encodeBase64Url(JSON.stringify(ctx.paths)));
    }

    decodeCode(code: string): Promise<DecodedShare> {
        const paths = JSON.parse(decoder.decode(decodeBase64Url(code)));
        return Promise.resolve({ paths });
    }
}

export const rawPathsShareLinkScheme = new RawPathsShareLinkScheme();
