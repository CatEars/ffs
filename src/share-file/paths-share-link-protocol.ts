import { decodeBase64Url, encodeBase64Url } from '@std/encoding/base64url';
import type { DecodedShare, ShareContext, ShareLinkProtocol } from './share-link-protocol.ts';

const MAX_PATHS_LENGTH = 1250;
const decoder = new TextDecoder();

export class PathsShareLinkProtocol implements ShareLinkProtocol {
    protocolId(): string {
        return 'paths';
    }

    isAvailable(ctx: ShareContext): boolean {
        return JSON.stringify(ctx.paths).length <= MAX_PATHS_LENGTH;
    }

    createCode(ctx: ShareContext): string {
        return encodeBase64Url(JSON.stringify(ctx.paths));
    }

    decodeCode(code: string): DecodedShare {
        const paths = JSON.parse(decoder.decode(decodeBase64Url(code)));
        return { paths };
    }
}

export const pathsShareLinkProtocol = new PathsShareLinkProtocol();
