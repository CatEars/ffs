import { assertEquals } from '@std/assert/equals';
import { setDownloadedFilename } from '../../../lib/http/set-filename.ts';
import type { Context } from '@oak/oak';

function makeCtx(): { ctx: Context; headers: Headers } {
    const headers = new Headers();
    const ctx = {
        response: { headers },
    } as unknown as Context;
    return { ctx, headers };
}

Deno.test('setDownloadedFilename sets the Content-Disposition header', () => {
    const { ctx, headers } = makeCtx();
    setDownloadedFilename(ctx, 'test-file.txt');
    assertEquals(headers.get('Content-Disposition'), 'attachment; filename="test-file.txt"');
});

Deno.test('setDownloadedFilename handles filenames with spaces', () => {
    const { ctx, headers } = makeCtx();
    setDownloadedFilename(ctx, 'my file.txt');
    assertEquals(headers.get('Content-Disposition'), 'attachment; filename="my file.txt"');
});

Deno.test('setDownloadedFilename overwrites a previously set header', () => {
    const { ctx, headers } = makeCtx();
    setDownloadedFilename(ctx, 'first.txt');
    setDownloadedFilename(ctx, 'second.txt');
    assertEquals(headers.get('Content-Disposition'), 'attachment; filename="second.txt"');
});
