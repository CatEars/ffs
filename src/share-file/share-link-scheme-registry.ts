import type { DecodedShare, ShareContext, ShareLinkScheme } from './share-link-scheme.ts';
import { rawPathsShareLinkScheme } from './raw-paths-share-link-scheme.ts';

const SCHEME_SEPARATOR = ':';

export class ShareLinkSchemeRegistry {
    constructor(private readonly schemes: ShareLinkScheme[]) {}

    isAvailable(ctx: ShareContext): boolean {
        return this.schemes.some((s) => s.isAvailable(ctx));
    }

    createCode(ctx: ShareContext): string {
        const scheme = this.schemes.find((s) => s.isAvailable(ctx));
        if (!scheme) {
            throw new Error('No available share link scheme for the given context');
        }
        return `${scheme.schemeId()}${SCHEME_SEPARATOR}${scheme.createCode(ctx)}`;
    }

    decodeCode(fullCode: string): DecodedShare {
        const separatorIndex = fullCode.indexOf(SCHEME_SEPARATOR);
        if (separatorIndex === -1) {
            throw new Error('Invalid share link code: missing scheme prefix');
        }
        const id = fullCode.substring(0, separatorIndex);
        const payload = fullCode.substring(separatorIndex + 1);
        const scheme = this.schemes.find((s) => s.schemeId() === id);
        if (!scheme) {
            throw new Error(`Unknown share link scheme: ${id}`);
        }
        return scheme.decodeCode(payload);
    }
}

export const shareLinkSchemeRegistry = new ShareLinkSchemeRegistry([rawPathsShareLinkScheme]);
