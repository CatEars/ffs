import { assert } from '@std/assert/assert';
import { sleep } from '../../../lib/sleep/sleep.ts';

Deno.test('sleep resolves after approximately the given number of milliseconds', async () => {
    const start = Date.now();
    await sleep(50);
    const elapsed = Date.now() - start;
    assert(elapsed >= 40, `Expected at least 40ms elapsed, got ${elapsed}ms`);
});

Deno.test('sleep with 0ms resolves immediately', async () => {
    await sleep(0);
    assert(true);
});
