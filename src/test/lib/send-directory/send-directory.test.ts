import type { Context } from '@oak/oak';
import { assertEquals } from '@std/assert/equals';
import { HTTP_400_BAD_REQUEST } from '../../../lib/http/http-codes.ts';
import { sendDirectory } from '../../../lib/send-directory/send-directory.ts';

function makeCtx() {
    let status: number | undefined = undefined;
    let responseType = '';
    let responseBody: unknown = undefined;

    const ctx = {
        response: {
            get status() {
                return status || 60000;
            },
            set status(value: number) {
                status = value;
            },
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
        getStatus: () => status,
        getType: () => responseType,
        getBody: () => responseBody,
    };
}

Deno.test('sendDirectory sets 400 status for a path traversal attack', async () => {
    const tempDir = await Deno.makeTempDir();
    const { ctx, getStatus } = makeCtx();

    sendDirectory(ctx, '../../etc/passwd', { root: tempDir });

    assertEquals(getStatus(), HTTP_400_BAD_REQUEST);
    await Deno.remove(tempDir);
});

Deno.test('sendDirectory sets content type and body for a valid directory', async () => {
    const tempDir = await Deno.makeTempDir();
    await Deno.writeTextFile(tempDir + '/file.txt', 'hello');
    const { ctx, getType, getBody } = makeCtx();

    sendDirectory(ctx, '.', { root: tempDir });

    assertEquals(getType(), 'application/gzip');
    assertEquals(getBody() instanceof ReadableStream, true);

    await (getBody() as ReadableStream).cancel();
    await Deno.remove(tempDir, { recursive: true });
});
