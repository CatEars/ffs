import type { DecodedShare, ShareContext, ShareLinkScheme } from './share-link-scheme.ts';
import { rawPathsShareLinkScheme } from './raw-paths-share-link-scheme.ts';
import { manifestShareLinkScheme } from './manifest-share-link-scheme.ts';

const SCHEME_SEPARATOR = ':';

export class ShareLinkSchemeRegistry {
    constructor(private readonly schemes: ShareLinkScheme[]) {}

    async isAvailable(ctx: ShareContext): Promise<boolean> {
        for (const s of this.schemes) {
            if (await s.isAvailable(ctx)) return true;
        }
        return false;
    }

    async createCode(ctx: ShareContext): Promise<string> {
        for (const scheme of this.schemes) {
            if (await scheme.isAvailable(ctx)) {
                return `${scheme.schemeId()}${SCHEME_SEPARATOR}${await scheme.createCode(ctx)}`;
            }
        }
        throw new Error('No available share link scheme for the given context');
    }

    async decodeCode(fullCode: string): Promise<DecodedShare> {
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

export const shareLinkSchemeRegistry = new ShareLinkSchemeRegistry([
    rawPathsShareLinkScheme,
    manifestShareLinkScheme,
]);
