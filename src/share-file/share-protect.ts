import { Middleware } from '@oak/oak';
import { HTTP_400_BAD_REQUEST, HTTP_401_UNAUTHORIZED } from '../utils/http-codes.ts';
import { signAndUrlEncodeClaims, verifyAndUrlDecodeClaims } from '../security/claims.ts';
import { ResourceManager } from '../security/resources.ts';

const fileShareResources = new ResourceManager('file-share');

export async function generateSignatureForCode(code: string) {
    const claim = fileShareResources.nameForResource(code);
    return await signAndUrlEncodeClaims([claim]);
}

export const shareProtect: Middleware = async (ctx, next) => {
    const codeFromUrl = ctx.request.url.searchParams.get('code');
    const signatureFromUrl = ctx.request.url.searchParams.get('signature');
    if (!codeFromUrl || !signatureFromUrl) {
        ctx.response.status = HTTP_400_BAD_REQUEST;
        return;
    }
    const verifiedClaims = await verifyAndUrlDecodeClaims(signatureFromUrl);
    const codeResource = fileShareResources.nameForResource(codeFromUrl);
    if (!verifiedClaims || !fileShareResources.mayAccess(verifiedClaims, codeResource)) {
        ctx.response.status = HTTP_401_UNAUTHORIZED;
        return;
    }
    return next();
};
