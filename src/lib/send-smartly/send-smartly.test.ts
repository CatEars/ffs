import { assertEquals } from '@std/assert/equals';
import { assert } from '@std/assert/assert';
import { HTTP_400_BAD_REQUEST } from '../http/http-codes.ts';
import { sendFilesSmartly } from './send-smartly.ts';
import type { Context } from '@oak/oak';

function makeCtx() {
    let status: number | undefined = undefined;
    let responseType = '';
    let responseBody: unknown = undefined;
    let sentOptions: unknown = undefined;

    const ctx = {
        response: {
            headers: new Headers(),
            get status() {
                return status;
            },
            set status(value: number) {
                status = value;
            },
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
        send(opts: unknown) {
            sentOptions = opts;
            return Promise.resolve();
        },
    } as unknown as Context;

    return {
        ctx,
        getStatus: () => status,
        getType: () => responseType,
        getBody: () => responseBody,
        getSentOptions: () => sentOptions,
    };
}

Deno.test('sendFilesSmartly sets 400 status when no file paths are provided', async () => {
    const tempDir = await Deno.makeTempDir();
    const { ctx, getStatus } = makeCtx();

    await sendFilesSmartly(ctx, [], { root: tempDir });

    assertEquals(getStatus(), HTTP_400_BAD_REQUEST);
    await Deno.remove(tempDir);
});

Deno.test('sendFilesSmartly sends a single file using ctx.send', async () => {
    const tempDir = await Deno.makeTempDir();
    await Deno.writeTextFile(tempDir + '/file.txt', 'content');
    const { ctx, getSentOptions } = makeCtx();

    await sendFilesSmartly(ctx, ['file.txt'], { root: tempDir });

    assert(getSentOptions() !== undefined);
    await Deno.remove(tempDir, { recursive: true });
});

Deno.test('sendFilesSmartly sends a single directory as a tar.gz stream', async () => {
    const tempDir = await Deno.makeTempDir();
    await Deno.mkdir(tempDir + '/subdir');
    await Deno.writeTextFile(tempDir + '/subdir/file.txt', 'x');
    const { ctx, getType, getBody } = makeCtx();

    await sendFilesSmartly(ctx, ['subdir'], { root: tempDir });

    assertEquals(getType(), 'application/gzip');
    assert(getBody() instanceof ReadableStream);
    await (getBody() as ReadableStream).cancel();
    await Deno.remove(tempDir, { recursive: true });
});

Deno.test('sendFilesSmartly sends multiple files as an archive', async () => {
    const tempDir = await Deno.makeTempDir();
    await Deno.writeTextFile(tempDir + '/a.txt', 'a');
    await Deno.writeTextFile(tempDir + '/b.txt', 'b');
    const { ctx, getType, getBody } = makeCtx();

    await sendFilesSmartly(ctx, ['a.txt', 'b.txt'], { root: tempDir });

    assertEquals(getType(), 'application/gzip');
    assert(getBody() instanceof ReadableStream);
    await (getBody() as ReadableStream).cancel();
    await Deno.remove(tempDir, { recursive: true });
});
