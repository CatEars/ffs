import { assert, assertRejects } from '@std/assert';
import { availableDiskBytes } from '../src/utils/disk-space.ts';

Deno.test('availableDiskBytes returns a positive number for a valid path', async () => {
    const bytes = await availableDiskBytes('.');
    assert(bytes > 0);
});

Deno.test('availableDiskBytes rejects for a non-existent path', async () => {
    await assertRejects(() => availableDiskBytes('/this/path/does/not/exist'));
});
