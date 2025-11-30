import { getInstanceSecret } from '../config.ts';
import { decodeBase64Url, encodeBase64Url } from '@std/encoding/base64url';
import { decodeBase64, encodeBase64 } from '@std/encoding/base64';
import { AccessLevel } from './resources.ts';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

let _cachedKey: CryptoKey | null = null;
async function getCryptoKey() {
    if (_cachedKey) {
        return _cachedKey;
    }
    const rawKey = encoder.encode(getInstanceSecret());
    _cachedKey = await crypto.subtle.importKey(
        'raw',
        rawKey,
        {
            name: 'HMAC',
            hash: 'SHA-256',
        },
        false,
        ['sign', 'verify'],
    );
    return _cachedKey;
}

export type Claims = AccessLevel[];

async function signClaim(claim: string) {
    const key = await getCryptoKey();
    const claimBytes = encoder.encode(claim);
    return await crypto.subtle.sign('HMAC', key, claimBytes);
}

export async function signAndUrlEncodeClaims(claims: Claims): Promise<string> {
    const stringifiedClaims = JSON.stringify(claims);
    const hmac = await signClaim(stringifiedClaims);
    const hmacBase64 = encodeBase64(hmac);
    return encodeBase64Url(JSON.stringify({
        claims: stringifiedClaims,
        hmac: hmacBase64,
    }));
}

async function isValidClaim(claim: string, hmac: Uint8Array<ArrayBuffer>) {
    const key = await getCryptoKey();
    const claimBytes = encoder.encode(claim);
    return await crypto.subtle.verify('HMAC', key, hmac, claimBytes);
}

export async function verifyAndUrlDecodeClaims(claimStr: string) {
    const baseClaims = JSON.parse(decoder.decode(decodeBase64Url(claimStr)));
    if (!baseClaims.claims || !baseClaims.hmac) {
        return null;
    }

    const stringifiedClaims = baseClaims.claims as string;
    const hmac = decodeBase64(baseClaims.hmac);
    const isValid = await isValidClaim(stringifiedClaims, hmac);
    if (!isValid) {
        return null;
    }

    return JSON.parse(stringifiedClaims) as Claims;
}
