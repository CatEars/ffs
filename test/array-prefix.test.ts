import { assert } from '@std/assert/assert';
import { assertFalse } from '@std/assert/false';
import { isPrefix } from '../src/utils/array-prefix.ts';

Deno.test('Empty array is prefix to all other arrays', () => {
    assert(isPrefix([], []));
    assert(isPrefix([], ['a']));
    assert(isPrefix([], ['b']));
    assert(isPrefix([], ['c', 'd', 'e', 'f']));
});

Deno.test('One prefix element with longer target is prefix', () => {
    assert('test' === 'test');
    assert(isPrefix(['test'], ['test', '1', '2', '3']));
});

Deno.test('Mismatching prefix is not prefix', () => {
    assertFalse(isPrefix(['test2'], ['test']));
    assertFalse(isPrefix(['test2'], []));
});

Deno.test('Exactly matching longer prefix is prefix', () => {
    assert(isPrefix(['test', '1', '2', '3'], ['test', '1', '2', '3']));
});
