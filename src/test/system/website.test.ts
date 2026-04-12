import { assertEquals } from '@std/assert/equals';
import { baseUrl } from '../constants.ts';
import { HTTP_200_OK, HTTP_401_UNAUTHORIZED } from '../../lib/http/http-codes.ts';
import { assert } from '@std/assert/assert';
import { authenticatedFetch } from '../authenticated-fetch.ts';

Deno.test('there is a website that kinda looks like HTML', async () => {
    const result = await fetch(baseUrl + '/');
    assertEquals(HTTP_200_OK, result.status);
    assert((await result.text()).includes('<!DOCTYPE html>'));
});

Deno.test("there is a 'failed to logon' webpage that kinda looks like HTML", async () => {
    const result = await fetch(baseUrl + '/logon/fail');
    assertEquals(HTTP_200_OK, result.status);
    assert((await result.text()).includes('<!DOCTYPE html>'));
});

Deno.test('It is not possible to access homepage without authentication', async () => {
    const result = await fetch(baseUrl + '/home/');
    await result.text();
    assertEquals(result.status, HTTP_401_UNAUTHORIZED);
});

Deno.test('It is possible to access homepage with authentication', async () => {
    const result = await authenticatedFetch(baseUrl + '/home/');
    await result.text();
    assertEquals(result.status, HTTP_200_OK);
});


Deno.test('GET /logout redirects to the landing page', async () => {
    const result = await fetch(baseUrl + '/logout', { redirect: 'manual' });
    await result.body?.cancel();
    assert(result.status >= 300 && result.status < 400);
    const location = result.headers.get('location')!;
    assertEquals(new URL(location, baseUrl).pathname, '/');
});

Deno.test('GET /logout clears the FFS-Authorization cookie', async () => {
    const result = await fetch(baseUrl + '/logout', { redirect: 'manual' });
    await result.body?.cancel();
    const setCookie = result.headers.get('set-cookie') ?? '';
    assert(setCookie.includes('FFS-Authorization='));
    const lowerSetCookie = setCookie.toLowerCase();
    assert(lowerSetCookie.includes('expires=') || lowerSetCookie.includes('max-age=0'));
});
