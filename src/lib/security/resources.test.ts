import { assert } from '@std/assert/assert';
import { assertFalse } from '@std/assert/false';
import { assertEquals } from '@std/assert/equals';
import {
    ResourceManager,
    getRootAccessLevel,
    isRootAccessLevel,
    getKnownResourceTypes,
} from './resources.ts';

Deno.test('ResourceManager.mayAccess returns true when access level is a prefix of the resource', () => {
    const rm = new ResourceManager('files');
    assert(rm.mayAccess([['files']], ['files', 'dir', 'file.txt']));
});

Deno.test('ResourceManager.mayAccess returns true for root access level', () => {
    const rm = new ResourceManager('files');
    assert(rm.mayAccess([[]], ['files', 'secret.txt']));
});

Deno.test('ResourceManager.mayAccess returns false when access level does not match', () => {
    const rm = new ResourceManager('files');
    assertFalse(rm.mayAccess([['admin']], ['files', 'file.txt']));
});

Deno.test('ResourceManager.nameForResource builds a resource array', () => {
    const rm = new ResourceManager('files');
    assertEquals(rm.nameForResource('dir', 'file.txt'), ['dir', 'file.txt']);
});

Deno.test('ResourceManager.rootResourceName returns the resource type name', () => {
    const rm = new ResourceManager('uploads');
    assertEquals(rm.rootResourceName(), ['uploads']);
});

Deno.test('ResourceManager.getFirstMatchingAccessLevel finds a matching level', () => {
    const rm = new ResourceManager('files');
    const match = rm.getFirstMatchingAccessLevel([['admin'], ['files', 'dir']]);
    assertEquals(match, ['files', 'dir']);
});

Deno.test('ResourceManager.getFirstMatchingAccessLevel returns root access level when present', () => {
    const rm = new ResourceManager('files');
    const match = rm.getFirstMatchingAccessLevel([[], ['files']]);
    assertEquals(match, []);
});

Deno.test('ResourceManager.stripResourceTypeName removes the first element', () => {
    const rm = new ResourceManager('files');
    assertEquals(rm.stripResourceTypeName(['files', 'subdir', 'file.txt']), ['subdir', 'file.txt']);
});

Deno.test('isRootAccessLevel returns true for empty array', () => {
    assert(isRootAccessLevel([]));
});

Deno.test('isRootAccessLevel returns false for non-empty array', () => {
    assertFalse(isRootAccessLevel(['files']));
});

Deno.test('getRootAccessLevel returns empty array', () => {
    assertEquals(getRootAccessLevel(), []);
});

Deno.test('getKnownResourceTypes includes registered resource type names', () => {
    new ResourceManager('widgets');
    assert(getKnownResourceTypes().has('widgets'));
});
