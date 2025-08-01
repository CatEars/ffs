import { ApiEndpointDefinition } from '../src/sitemap/index.ts';
import { baseUrl } from './constants.ts';
import { assertEquals } from '@std/assert/equals';
import { HTTP_401_UNAUTHORIZED } from '../src/utils/http-codes.ts';

const publicApiEndpoints = ['/api/sitemap', '/api/logon', '/api/user-logon'];

Deno.test('All /api endpoints are secured, except those whitelisted', async () => {
    const fetchResult = await fetch(baseUrl + '/api/sitemap');
    const siteMap: ApiEndpointDefinition[] = await fetchResult.json();
    const apiRoutes = siteMap.filter((x) =>
        x.path.startsWith('/api/') && !publicApiEndpoints.includes(x.path)
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
