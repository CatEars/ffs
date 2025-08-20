import { Middleware } from '@oak/oak';
import { HTTP_400_BAD_REQUEST, HTTP_401_UNAUTHORIZED } from '../utils/http-codes.ts';
import { decodeBase64Url } from 'jsr:@std/encoding/base64url';
import { signAndUrlEncodeClaims, verifyAndUrlDecodeClaims } from '../security/claims.ts';
import { ResourceManager } from '../security/resources.ts';

const fileShareResources = new ResourceManager('file-share');

const decoder = new TextDecoder();

export async function generateHmacForFile(paths: string[]) {
    const claims = paths.map((p) => fileShareResources.nameForResource(p));
    return await signAndUrlEncodeClaims(claims);
}

export const shareProtect: Middleware = async (ctx, next) => {
    const pathsFromUrl = ctx.request.url.searchParams.get('paths');
    const hmacFromUrl = ctx.request.url.searchParams.get('hmac');
    if (!pathsFromUrl || !hmacFromUrl) {
        ctx.response.status = HTTP_400_BAD_REQUEST;
        return;
    }
    const validatedPaths = await verifyAndUrlDecodeClaims(hmacFromUrl);
    if (!validatedPaths) {
        ctx.response.status = HTTP_401_UNAUTHORIZED;
        return;
    }

    const decoded = decoder.decode(decodeBase64Url(pathsFromUrl));
    const paths = JSON.parse(decoded);
    const hasAccess = paths.every((path: string) =>
        fileShareResources.mayAccess(validatedPaths, fileShareResources.nameForResource(path))
    );

    if (hasAccess) {
        return next();
    } else {
        ctx.response.status = HTTP_401_UNAUTHORIZED;
    }
};
