import { assertEquals } from '@std/assert/equals';
import { assert } from '@std/assert/assert';
import { assertFalse } from '@std/assert/false';
import { assertThrows } from '@std/assert/throws';
import { ShareLinkSchemeRegistry } from '../src/share-file/share-link-scheme-registry.ts';
import type {
    DecodedShare,
    ShareContext,
    ShareLinkScheme,
} from '../src/share-file/share-link-scheme.ts';

class FakeScheme implements ShareLinkScheme {
    constructor(
        private readonly id: string,
        private readonly available: boolean,
    ) {}

    schemeId(): string {
        return this.id;
    }

    isAvailable(_ctx: ShareContext): Promise<boolean> {
        return Promise.resolve(this.available);
    }

    createCode(ctx: ShareContext): Promise<string> {
        return Promise.resolve(ctx.paths.join(','));
    }

    decodeCode(code: string): Promise<DecodedShare> {
        return Promise.resolve({ paths: code ? code.split(',') : [] });
    }
}

Deno.test('isAvailable returns true when at least one scheme is available', async () => {
    const registry = new ShareLinkSchemeRegistry([
        new FakeScheme('a', false),
        new FakeScheme('b', true),
    ]);
    assert(await registry.isAvailable({ paths: ['file.txt'] }));
});

Deno.test('isAvailable returns false when no scheme is available', async () => {
    const registry = new ShareLinkSchemeRegistry([
        new FakeScheme('a', false),
        new FakeScheme('b', false),
    ]);
    assertFalse(await registry.isAvailable({ paths: ['file.txt'] }));
});

Deno.test('createCode selects the first available scheme and prepends its id', async () => {
    const registry = new ShareLinkSchemeRegistry([
        new FakeScheme('a', false),
        new FakeScheme('b', true),
    ]);
    const code = await registry.createCode({ paths: ['file.txt'] });
    assertEquals(code, 'b:file.txt');
});

Deno.test('createCode throws when no scheme is available', async () => {
    const registry = new ShareLinkSchemeRegistry([new FakeScheme('a', false)]);
    await assertThrows(async () => await registry.createCode({ paths: ['file.txt'] }));
});

Deno.test('decodeCode routes to the correct scheme by id prefix', async () => {
    const registry = new ShareLinkSchemeRegistry([
        new FakeScheme('a', true),
        new FakeScheme('b', true),
    ]);
    const decoded = await registry.decodeCode('b:file1.txt,file2.txt');
    assertEquals(decoded.paths, ['file1.txt', 'file2.txt']);
});

Deno.test('decodeCode throws on code missing scheme prefix', async () => {
    const registry = new ShareLinkSchemeRegistry([new FakeScheme('a', true)]);
    await assertThrows(async () => await registry.decodeCode('nocolon'));
});

Deno.test('decodeCode throws on unknown scheme id', async () => {
    const registry = new ShareLinkSchemeRegistry([new FakeScheme('a', true)]);
    await assertThrows(async () => await registry.decodeCode('unknown:payload'));
});

Deno.test('createCode and decodeCode round-trip through registry', async () => {
    const registry = new ShareLinkSchemeRegistry([new FakeScheme('a', true)]);
    const paths = ['folder/file1.txt', 'folder/file2.txt'];
    const code = await registry.createCode({ paths });
    const decoded = await registry.decodeCode(code);
    assertEquals(decoded.paths, paths);
});
