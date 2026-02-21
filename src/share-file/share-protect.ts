import { Middleware } from '@oak/oak';
import { HTTP_400_BAD_REQUEST, HTTP_401_UNAUTHORIZED } from '../utils/http-codes.ts';
import { Claims, signAndUrlEncodeClaims, verifyAndUrlDecodeClaims } from '../security/claims.ts';
import { ResourceManager } from '../security/resources.ts';

const fileShareResources = new ResourceManager('file-share');

export async function generateSignedCode(pathCode: string) {
    const claim = fileShareResources.nameForResource(pathCode);
    return await signAndUrlEncodeClaims([claim]);
}

function extractPathCode(verifiedClaims: Claims): string | undefined {
    const [firstClaim] = verifiedClaims;
    return firstClaim?.[0];
}

export const shareProtect: Middleware = async (ctx, next) => {
    const signedCode = ctx.request.url.searchParams.get('code');
    if (!signedCode) {
        ctx.response.status = HTTP_400_BAD_REQUEST;
        return;
    }
    const verifiedClaims = await verifyAndUrlDecodeClaims(signedCode);
    if (!verifiedClaims) {
        ctx.response.status = HTTP_401_UNAUTHORIZED;
        return;
    }
    const pathCode = extractPathCode(verifiedClaims);
    if (!pathCode) {
        ctx.response.status = HTTP_401_UNAUTHORIZED;
        return;
    }
    ctx.state.pathCode = pathCode;
    return next();
};
