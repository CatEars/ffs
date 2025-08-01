import { Middleware } from '@oak/oak';
import { getInstanceSecret } from '../config.ts';
import { HTTP_400_BAD_REQUEST, HTTP_401_UNAUTHORIZED } from '../utils/http-codes.ts';
import { decodeBase64Url, encodeBase64Url } from 'jsr:@std/encoding/base64url';

const encoder = new TextEncoder();

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

async function signClaim(claim: string) {
    const key = await getCryptoKey();
    const claimBytes = encoder.encode(claim);
    return await crypto.subtle.sign('HMAC', key, claimBytes);
}

async function validateHmac(claim: string, hmac: Uint8Array) {
    const key = await getCryptoKey();
    const claimBytes = encoder.encode(claim);
    return await crypto.subtle.verify('HMAC', key, hmac, claimBytes);
}

function buildClaim(paths: string[]) {
    return JSON.stringify({ paths });
}

export async function generateHmacForFile(paths: string[]) {
    const claim = buildClaim(paths);
    const hmacBytes = await signClaim(claim);
    return encodeBase64Url(hmacBytes);
}

export const shareProtect: Middleware = async (ctx, next) => {
    const pathsFromUrl = ctx.request.url.searchParams.get('paths');
    const hmacFromUrl = ctx.request.url.searchParams.get('hmac');
    if (!pathsFromUrl || !hmacFromUrl) {
        ctx.response.status = HTTP_400_BAD_REQUEST;
        return;
    }
    const paths = JSON.parse(decodeBase64Url(pathsFromUrl));
    const hmac = decodeBase64Url(hmacFromUrl);
    const claim = buildClaim(paths);
    if (await validateHmac(claim, hmac)) {
        return next();
    } else {
        ctx.response.status = HTTP_401_UNAUTHORIZED;
    }
};
