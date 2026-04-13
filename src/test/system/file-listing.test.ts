import { assertEquals } from '@std/assert';
import { assert } from '@std/assert/assert';
import {
    HTTP_200_OK,
    HTTP_401_UNAUTHORIZED,
    HTTP_403_FORBIDDEN,
    HTTP_404_NOT_FOUND,
} from '../../lib/http/http-codes.ts';
import { authenticatedFetch } from '../authenticated-fetch.ts';
import { baseUrl } from '../constants.ts';

type FileListing = {
    name: string;
    isFile: boolean;
};

Deno.test('Can fetch directory contents', async () => {
    const result = await authenticatedFetch(baseUrl + '/api/directory?path=.');
    const directoryListing = await result.json();
    assert(
        directoryListing.some((x: FileListing) => x.name === 'deno.jsonc' && x.isFile),
    );
});

Deno.test('Cannot fetch a super-directory of the store directory', async () => {
    const result = await authenticatedFetch(baseUrl + '/api/directory?path=..');
    await result.text();
    assertEquals(result.status, HTTP_404_NOT_FOUND);
});

Deno.test('Fetching / returns files from store root', async () => {
    const result = await authenticatedFetch(baseUrl + '/api/directory?path=/');
    const directoryListing = await result.json();
    assertEquals(result.status, HTTP_200_OK);
    assert(Array.isArray(directoryListing) && directoryListing.length > 0);
});

Deno.test('Cannot fetch path traversal with ../', async () => {
    const result = await authenticatedFetch(baseUrl + '/api/directory?path=../');
    await result.text();
    assertEquals(result.status, HTTP_404_NOT_FOUND);
});

Deno.test('Listing directory gets unauthorized when not using API key', async () => {
    const result = await fetch(baseUrl + '/api/directory?path=.');
    await result.text();
    assertEquals(result.status, HTTP_401_UNAUTHORIZED);
});

Deno.test('Fetching file works', async () => {
    const result = await authenticatedFetch(baseUrl + '/api/file?path=deno.jsonc');
    const denoFile = await result.json();
    assert(denoFile['imports'] && denoFile['imports']['@oak/oak']);
});

Deno.test('Not allowed to fetch a super-directory of the store directory', async () => {
    const result = await authenticatedFetch(baseUrl + '/api/file?path=..');
    await result.text();
    assertEquals(result.status, HTTP_403_FORBIDDEN);
});

Deno.test('Not allowed to fetch / directory as file', async () => {
    const result = await authenticatedFetch(baseUrl + '/api/file?path=/');
    await result.text();
    assertEquals(result.status, HTTP_404_NOT_FOUND);
});

Deno.test('Can upload files', async () => {
    const csrfToken = 'test-csrf-token';
    const formData = new FormData();
    const fileName = 'README.md';
    formData.append(
        'file',
        new Blob([Deno.readFileSync(fileName)], { type: 'text/plain' }),
        fileName,
    );
    formData.append('directory', '.');
    formData.append('ffs_csrf_protection', csrfToken);

    const result = await authenticatedFetch(baseUrl + '/api/file/upload', {
        method: 'POST',
        body: formData,
        redirect: 'manual',
        headers: {
            'Cookie': `FFS-Csrf-Protection=${csrfToken}`,
            'Referer': baseUrl + '/file-manager',
        },
    });
    await result.text();
    assert(result.status >= 300 && result.status < 400, `Expected redirect, got ${result.status}`);
    try {
        Deno.removeSync('README Copy.md');
    } catch {
        // ignore cleanup errors
    }
});
