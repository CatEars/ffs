import { assertEquals } from '@std/assert/equals';
import { collectMap } from '../../../lib/functional/collect-map.ts';

Deno.test('collectMap collects values from a map values iterator', () => {
    const map = new Map([
        ['a', 1],
        ['b', 2],
        ['c', 3],
    ]);
    const result = collectMap(map.values()).sort((a, b) => a - b);
    assertEquals(result, [1, 2, 3]);
});

Deno.test('collectMap returns empty array for an empty map', () => {
    const map = new Map<string, number>();
    const result = collectMap(map.values());
    assertEquals(result, []);
});

Deno.test('collectMap collects keys from a map keys iterator', () => {
    const map = new Map([
        ['x', 1],
        ['y', 2],
    ]);
    const result = collectMap(map.keys()).sort();
    assertEquals(result, ['x', 'y']);
});
