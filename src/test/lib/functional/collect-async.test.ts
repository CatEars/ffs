import { assertEquals } from '@std/assert/equals';
import { collectAsync } from '../../../lib/functional/collect-async.ts';

Deno.test('collectAsync collects all elements from an async iterable', async () => {
    async function* gen() {
        yield 1;
        yield 2;
        yield 3;
    }
    const result = await collectAsync(gen());
    assertEquals(result, [1, 2, 3]);
});

Deno.test('collectAsync returns empty array for empty async iterable', async () => {
    async function* gen() {}
    const result = await collectAsync(gen());
    assertEquals(result, []);
});

Deno.test('collectAsync preserves element order', async () => {
    async function* gen() {
        yield 'c';
        yield 'a';
        yield 'b';
    }
    const result = await collectAsync(gen());
    assertEquals(result, ['c', 'a', 'b']);
});
