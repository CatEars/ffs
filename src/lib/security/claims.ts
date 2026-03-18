import { decodeBase64, encodeBase64 } from '@std/encoding/base64';
import { decodeBase64Url, encodeBase64Url } from '@std/encoding/base64url';
import { AccessLevel } from './resources.ts';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

async function generateCryptoKey(instanceSecret: string) {
    const rawKey = encoder.encode(instanceSecret);
    const importedKey = await crypto.subtle.importKey(
        'raw',
        rawKey,
        {
            name: 'HMAC',
            hash: 'SHA-256',
        },
        false,
        ['sign', 'verify'],
    );
    return importedKey;
}

export type Claims = AccessLevel[];

export class ClaimCodec {
    private readonly instanceSecret: string;
    private _cachedKey: CryptoKey | null = null;

    constructor(instanceSecret: string) {
        this.instanceSecret = instanceSecret;
    }

    async signAndUrlEncodeClaims(claims: Claims): Promise<string> {
        const stringifiedClaims = JSON.stringify(claims);
        const hmac = await this.#signClaim(stringifiedClaims);
        const hmacBase64 = encodeBase64(hmac);
        return encodeBase64Url(JSON.stringify({
            claims: stringifiedClaims,
            hmac: hmacBase64,
        }));
    }

    async verifyAndUrlDecodeClaims(claimStr: string): Promise<Claims | null> {
        const baseClaims = JSON.parse(decoder.decode(decodeBase64Url(claimStr)));
        if (!baseClaims.claims || !baseClaims.hmac) {
            return null;
        }

        const stringifiedClaims = baseClaims.claims as string;
        const hmac = decodeBase64(baseClaims.hmac);
        const isValid = await this.#isValidClaim(stringifiedClaims, hmac);
        if (!isValid) {
            return null;
        }

        return JSON.parse(stringifiedClaims) as Claims;
    }

    async #signClaim(claim: string) {
        const key = await this.#getCryptoKey();
        const claimBytes = encoder.encode(claim);
        return await crypto.subtle.sign('HMAC', key, claimBytes);
    }

    async #isValidClaim(claim: string, hmac: Uint8Array<ArrayBuffer>) {
        const key = await this.#getCryptoKey();
        const claimBytes = encoder.encode(claim);
        return await crypto.subtle.verify('HMAC', key, hmac, claimBytes);
    }

    async #getCryptoKey() {
        if (this._cachedKey) {
            return this._cachedKey;
        }
        return this._cachedKey = await generateCryptoKey(this.instanceSecret);
    }
}
