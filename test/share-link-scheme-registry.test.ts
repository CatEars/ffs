import { assertEquals } from '@std/assert/equals';
import { assert } from '@std/assert/assert';
import { assertFalse } from '@std/assert/false';
import { assertThrows } from '@std/assert/throws';
import { ShareLinkSchemeRegistry } from '../src/share-file/share-link-scheme-registry.ts';
import type {
    DecodedShare,
    ShareContext,
    ShareLinkScheme,
} from '../src/share-file/share-link-protocol.ts';

class FakeScheme implements ShareLinkScheme {
    constructor(
        private readonly id: string,
        private readonly available: boolean,
    ) {}

    schemeId(): string {
        return this.id;
    }

    isAvailable(_ctx: ShareContext): boolean {
        return this.available;
    }

    createCode(ctx: ShareContext): string {
        return ctx.paths.join(',');
    }

    decodeCode(code: string): DecodedShare {
        return { paths: code ? code.split(',') : [] };
    }
}

Deno.test('isAvailable returns true when at least one scheme is available', () => {
    const registry = new ShareLinkSchemeRegistry([
        new FakeScheme('a', false),
        new FakeScheme('b', true),
    ]);
    assert(registry.isAvailable({ paths: ['file.txt'] }));
});

Deno.test('isAvailable returns false when no scheme is available', () => {
    const registry = new ShareLinkSchemeRegistry([
        new FakeScheme('a', false),
        new FakeScheme('b', false),
    ]);
    assertFalse(registry.isAvailable({ paths: ['file.txt'] }));
});

Deno.test('createCode selects the first available scheme and prepends its id', () => {
    const registry = new ShareLinkSchemeRegistry([
        new FakeScheme('a', false),
        new FakeScheme('b', true),
    ]);
    const code = registry.createCode({ paths: ['file.txt'] });
    assertEquals(code, 'b:file.txt');
});

Deno.test('createCode throws when no scheme is available', () => {
    const registry = new ShareLinkSchemeRegistry([new FakeScheme('a', false)]);
    assertThrows(() => registry.createCode({ paths: ['file.txt'] }));
});

Deno.test('decodeCode routes to the correct scheme by id prefix', () => {
    const registry = new ShareLinkSchemeRegistry([
        new FakeScheme('a', true),
        new FakeScheme('b', true),
    ]);
    const decoded = registry.decodeCode('b:file1.txt,file2.txt');
    assertEquals(decoded.paths, ['file1.txt', 'file2.txt']);
});

Deno.test('decodeCode throws on code missing scheme prefix', () => {
    const registry = new ShareLinkSchemeRegistry([new FakeScheme('a', true)]);
    assertThrows(() => registry.decodeCode('nocolon'));
});

Deno.test('decodeCode throws on unknown scheme id', () => {
    const registry = new ShareLinkSchemeRegistry([new FakeScheme('a', true)]);
    assertThrows(() => registry.decodeCode('unknown:payload'));
});

Deno.test('createCode and decodeCode round-trip through registry', () => {
    const registry = new ShareLinkSchemeRegistry([new FakeScheme('a', true)]);
    const paths = ['folder/file1.txt', 'folder/file2.txt'];
    const code = registry.createCode({ paths });
    const decoded = registry.decodeCode(code);
    assertEquals(decoded.paths, paths);
});
