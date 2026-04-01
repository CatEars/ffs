import { assertEquals } from '@std/assert/equals';
import { MemoryCache } from '../../../lib/cache/memory-cache.ts';

Deno.test('MemoryCache returns undefined for missing keys', () => {
    const cache = new MemoryCache<string>(1000);
    assertEquals(cache.get('nonexistent'), undefined);
});

Deno.test('MemoryCache returns stored value within TTL', () => {
    const cache = new MemoryCache<string>(10000);
    cache.set('key', 'value');
    assertEquals(cache.get('key'), 'value');
});

Deno.test('MemoryCache returns undefined for expired entries', async () => {
    const cache = new MemoryCache<string>(1);
    cache.set('key', 'value');
    await new Promise((resolve) => setTimeout(resolve, 10));
    assertEquals(cache.get('key'), undefined);
});

Deno.test('MemoryCache overwrites existing entries', () => {
    const cache = new MemoryCache<string>(10000);
    cache.set('key', 'first');
    cache.set('key', 'second');
    assertEquals(cache.get('key'), 'second');
});

Deno.test('MemoryCache stores multiple keys independently', () => {
    const cache = new MemoryCache<number>(10000);
    cache.set('a', 1);
    cache.set('b', 2);
    assertEquals(cache.get('a'), 1);
    assertEquals(cache.get('b'), 2);
});
