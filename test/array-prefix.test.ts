import { assert } from '@std/assert/assert';
import { assertFalse } from '@std/assert/false';
import { isArrayPrefix } from '../src/utils/array-prefix.ts';

Deno.test('Empty array is prefix to all other arrays', () => {
    assert(isArrayPrefix([], []));
    assert(isArrayPrefix([], ['a']));
    assert(isArrayPrefix([], ['b']));
    assert(isArrayPrefix([], ['c', 'd', 'e', 'f']));
});

Deno.test('One prefix element with longer target is prefix', () => {
    assert('test' === 'test');
    assert(isArrayPrefix(['test'], ['test', '1', '2', '3']));
});

Deno.test('Mismatching prefix is not prefix', () => {
    assertFalse(isArrayPrefix(['test2'], ['test']));
    assertFalse(isArrayPrefix(['test2'], []));
});

Deno.test('Exactly matching longer prefix is prefix', () => {
    assert(isArrayPrefix(['test', '1', '2', '3'], ['test', '1', '2', '3']));
});
