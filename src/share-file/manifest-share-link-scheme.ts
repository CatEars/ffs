import type { DecodedShare, ShareContext, ShareLinkScheme } from './share-link-scheme.ts';
import { availableDiskBytes } from '../utils/disk-space.ts';
import { getCacheRoot } from '../config.ts';
import { getManifestsDir } from '../files/cache-folder.ts';
import { join } from '@std/path';
import { ensureDir } from '@std/fs/ensure-dir';

const MIN_AVAILABLE_BYTES = 50 * 1024 * 1024;

async function sha256Hex(data: string): Promise<string> {
    const encoded = new TextEncoder().encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

function manifestPath(hash: string): string {
    return join(getManifestsDir(), `${hash}.json`);
}

const SHA256_HEX_REGEX = /^[0-9a-f]{64}$/;

export class ManifestShareLinkScheme implements ShareLinkScheme {
    schemeId(): string {
        return 'manifest';
    }

    async isAvailable(_ctx: ShareContext): Promise<boolean> {
        try {
            const availableBytes = await availableDiskBytes(getCacheRoot());
            return availableBytes >= MIN_AVAILABLE_BYTES;
        } catch {
            return false;
        }
    }

    async createCode(ctx: ShareContext): Promise<string> {
        const json = JSON.stringify(ctx.paths);
        const hash = await sha256Hex(json);
        await ensureDir(getManifestsDir());
        await Deno.writeTextFile(manifestPath(hash), JSON.stringify({ paths: ctx.paths }));
        return hash;
    }

    async decodeCode(code: string): Promise<DecodedShare> {
        if (!SHA256_HEX_REGEX.test(code)) {
            throw new Error('Invalid manifest code: not a valid SHA-256 hex string');
        }
        const content = await Deno.readTextFile(manifestPath(code));
        const { paths } = JSON.parse(content);
        if (!Array.isArray(paths)) {
            throw new Error('Invalid manifest: missing paths array');
        }
        return { paths };
    }
}

export const manifestShareLinkScheme = new ManifestShareLinkScheme();
