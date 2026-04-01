import { assertEquals } from '@std/assert/equals';
import { assert } from '@std/assert/assert';
import { sendAsArchive } from './send-as-archive.ts';
import type { Context } from '@oak/oak';

function makeCtx() {
    let responseType = '';
    let responseBody: unknown = undefined;
    let filename = '';

    const ctx = {
        response: {
            headers: new Headers(),
            get type() {
                return responseType;
            },
            set type(value: string) {
                responseType = value;
            },
            get body() {
                return responseBody;
            },
            set body(value: unknown) {
                responseBody = value;
            },
        },
    } as unknown as Context;

    return {
        ctx,
        getType: () => responseType,
        getBody: () => responseBody,
    };
}

Deno.test('sendAsArchive sets the response type to application/gzip', async () => {
    const tempDir = await Deno.makeTempDir();
    await Deno.writeTextFile(tempDir + '/file.txt', 'hello');
    const { ctx, getType, getBody } = makeCtx();

    sendAsArchive(ctx, ['file.txt'], { root: tempDir });

    assertEquals(getType(), 'application/gzip');
    await (getBody() as ReadableStream).cancel();
    await Deno.remove(tempDir, { recursive: true });
});

Deno.test('sendAsArchive sets the Content-Disposition header', async () => {
    const tempDir = await Deno.makeTempDir();
    await Deno.writeTextFile(tempDir + '/file.txt', 'hello');
    const { ctx, getBody } = makeCtx();

    sendAsArchive(ctx, ['file.txt'], { root: tempDir });

    const disposition = ctx.response.headers.get('Content-Disposition');
    assert(disposition !== null && disposition.includes('.tar.gz'));
    await (getBody() as ReadableStream).cancel();
    await Deno.remove(tempDir, { recursive: true });
});

Deno.test('sendAsArchive sets response body to a ReadableStream', async () => {
    const tempDir = await Deno.makeTempDir();
    await Deno.writeTextFile(tempDir + '/file.txt', 'hello');
    const { ctx, getBody } = makeCtx();

    sendAsArchive(ctx, ['file.txt'], { root: tempDir });

    assert(getBody() instanceof ReadableStream);
    await (getBody() as ReadableStream).cancel();
    await Deno.remove(tempDir, { recursive: true });
});

Deno.test('sendAsArchive ignores paths outside the root', async () => {
    const tempDir = await Deno.makeTempDir();
    const { ctx, getBody } = makeCtx();

    sendAsArchive(ctx, ['../../etc/passwd'], { root: tempDir });

    assert(getBody() instanceof ReadableStream);
    await (getBody() as ReadableStream).cancel();
    await Deno.remove(tempDir);
});
