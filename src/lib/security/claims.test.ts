import { assert } from '@std/assert/assert';
import { assertEquals } from '@std/assert/equals';
import { ClaimCodec } from './claims.ts';
import type { Claims } from './claims.ts';

Deno.test('ClaimCodec round-trips claims through sign and verify', async () => {
    const codec = new ClaimCodec('test-secret');
    const claims: Claims = [['files'], ['admin']];
    const encoded = await codec.signAndUrlEncodeClaims(claims);
    const decoded = await codec.verifyAndUrlDecodeClaims(encoded);
    assertEquals(decoded, claims);
});

Deno.test('ClaimCodec returns null for a tampered claim string', async () => {
    const codec = new ClaimCodec('test-secret');
    const claims: Claims = [['files']];
    const encoded = await codec.signAndUrlEncodeClaims(claims);
    const tampered = encoded.slice(0, -4) + 'XXXX';
    const result = await codec.verifyAndUrlDecodeClaims(tampered);
    assertEquals(result, null);
});

Deno.test('ClaimCodec returns null when verified with a different secret', async () => {
    const codec1 = new ClaimCodec('secret-one');
    const codec2 = new ClaimCodec('secret-two');
    const claims: Claims = [['files']];
    const encoded = await codec1.signAndUrlEncodeClaims(claims);
    const result = await codec2.verifyAndUrlDecodeClaims(encoded);
    assertEquals(result, null);
});

Deno.test('ClaimCodec encodes empty claims array correctly', async () => {
    const codec = new ClaimCodec('secret');
    const claims: Claims = [];
    const encoded = await codec.signAndUrlEncodeClaims(claims);
    const decoded = await codec.verifyAndUrlDecodeClaims(encoded);
    assertEquals(decoded, []);
});

Deno.test('ClaimCodec produces a non-empty URL-safe string', async () => {
    const codec = new ClaimCodec('secret');
    const encoded = await codec.signAndUrlEncodeClaims([['files']]);
    assert(encoded.length > 0);
    assert(!/[+/=]/.test(encoded));
});
