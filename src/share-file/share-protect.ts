import { Middleware } from '@oak/oak';
import { HTTP_400_BAD_REQUEST, HTTP_401_UNAUTHORIZED } from '../utils/http-codes.ts';
import { signAndUrlEncodeClaims, verifyAndUrlDecodeClaims } from '../security/claims.ts';

export async function generateSignatureForCode(code: string) {
    const claims = [[code]];
    return await signAndUrlEncodeClaims(claims);
}

export const shareProtect: Middleware = async (ctx, next) => {
    const codeFromUrl = ctx.request.url.searchParams.get('code');
    const signatureFromUrl = ctx.request.url.searchParams.get('signature');
    if (!codeFromUrl || !signatureFromUrl) {
        ctx.response.status = HTTP_400_BAD_REQUEST;
        return;
    }
    const verifiedClaims = await verifyAndUrlDecodeClaims(signatureFromUrl);
    if (!verifiedClaims || verifiedClaims[0]?.[0] !== codeFromUrl) {
        ctx.response.status = HTTP_401_UNAUTHORIZED;
        return;
    }
    return next();
};
