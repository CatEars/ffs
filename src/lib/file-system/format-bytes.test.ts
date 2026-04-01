import { assertEquals } from '@std/assert/equals';
import { formatBytes } from './format-bytes.ts';

Deno.test('formatBytes returns "0 Bytes" for 0', () => {
    assertEquals(formatBytes(0), '0 Bytes');
});

Deno.test('formatBytes formats bytes correctly', () => {
    assertEquals(formatBytes(512), '512 Bytes');
});

Deno.test('formatBytes formats kilobytes correctly', () => {
    assertEquals(formatBytes(1024), '1 KB');
});

Deno.test('formatBytes formats megabytes correctly', () => {
    assertEquals(formatBytes(1024 * 1024), '1 MB');
});

Deno.test('formatBytes formats gigabytes correctly', () => {
    assertEquals(formatBytes(1024 * 1024 * 1024), '1 GB');
});

Deno.test('formatBytes respects custom decimal places', () => {
    assertEquals(formatBytes(1536, 1), '1.5 KB');
});

Deno.test('formatBytes treats negative decimal argument as 0 decimals', () => {
    assertEquals(formatBytes(1536, -1), '2 KB');
});

Deno.test('formatBytes defaults to 2 decimal places', () => {
    assertEquals(formatBytes(1500), '1.46 KB');
});
