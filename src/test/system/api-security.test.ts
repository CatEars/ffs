import { ApiEndpointDefinition } from '../../app/api/sitemap/index.ts';
import { baseUrl } from '../constants.ts';
import { assertEquals } from '@std/assert/equals';
import { HTTP_400_BAD_REQUEST, HTTP_401_UNAUTHORIZED } from '../../lib/http/http-codes.ts';

const publicApiEndpoints = ['/api/sitemap', '/api/logon', '/api/user-logon'];

const shareProtectedEndpoints = ['/api/share-file/list', '/api/share-file/download'];

Deno.test('All /api endpoints are secured, except those whitelisted', async () => {
    const fetchResult = await fetch(baseUrl + '/api/sitemap');
    const siteMap: ApiEndpointDefinition[] = await fetchResult.json();
    const apiRoutes = siteMap.filter((x) =>
        x.path.startsWith('/api/') &&
        !publicApiEndpoints.includes(x.path) &&
        !shareProtectedEndpoints.includes(x.path)
    );
    for (const apiRoute of apiRoutes) {
        for (const method of apiRoute.methods) {
            const result = await fetch(baseUrl + apiRoute.path, {
                method,
            });
            assertEquals(
                result.status,
                HTTP_401_UNAUTHORIZED,
                `${method} ${apiRoute.path} is not properly protected with authorization!`,
            );
            await result.text();
        }
    }
});

Deno.test('Share-protected endpoints return 400 when code param is missing', async () => {
    for (const path of shareProtectedEndpoints) {
        const result = await fetch(baseUrl + path);
        assertEquals(
            result.status,
            HTTP_400_BAD_REQUEST,
            `${path} should return 400 when code param is missing`,
        );
        await result.text();
    }
});

Deno.test('Share-protected endpoints return 401 when code param is invalid', async () => {
    for (const path of shareProtectedEndpoints) {
        const result = await fetch(baseUrl + path + '?code=invalid-token');
        assertEquals(
            result.status,
            HTTP_401_UNAUTHORIZED,
            `${path} should return 401 when code is present but invalid`,
        );
        await result.text();
    }
});
