import { assert } from '@std/assert/assert';
import { assertEquals } from '@std/assert/equals';
import { pbkdf2Hash } from '../../../lib/security/password-hash.ts';

Deno.test('pbkdf2Hash returns a non-empty base64 string', () => {
    const hash = pbkdf2Hash('password', 'salt');
    assert(hash.length > 0);
});

Deno.test('pbkdf2Hash is deterministic for the same password and salt', () => {
    const hash1 = pbkdf2Hash('mypassword', 'mysalt');
    const hash2 = pbkdf2Hash('mypassword', 'mysalt');
    assertEquals(hash1, hash2);
});

Deno.test('pbkdf2Hash produces different hashes for different passwords', () => {
    const hash1 = pbkdf2Hash('password1', 'salt');
    const hash2 = pbkdf2Hash('password2', 'salt');
    assert(hash1 !== hash2);
});

Deno.test('pbkdf2Hash produces different hashes for different salts', () => {
    const hash1 = pbkdf2Hash('password', 'salt1');
    const hash2 = pbkdf2Hash('password', 'salt2');
    assert(hash1 !== hash2);
});
