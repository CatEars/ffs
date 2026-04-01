import { assertEquals } from '@std/assert/equals';
import { returnToSender } from './return-to-sender.ts';
import type { Context } from '@oak/oak';

function makeCtx(referer: string | null): { ctx: Context; getRedirect: () => string } {
    let redirectedTo = '';
    const headers = new Headers();
    if (referer !== null) {
        headers.set('Referer', referer);
    }
    const ctx = {
        request: { headers },
        response: {
            redirect(url: string) {
                redirectedTo = url;
            },
        },
    } as unknown as Context;
    return { ctx, getRedirect: () => redirectedTo };
}

Deno.test('returnToSender redirects to the Referer URL', () => {
    const { ctx, getRedirect } = makeCtx('http://localhost:8080/folder');
    returnToSender(ctx);
    assertEquals(getRedirect(), 'http://localhost:8080/folder');
});

Deno.test('returnToSender falls back to defaultPath when no Referer header is present', () => {
    const { ctx, getRedirect } = makeCtx(null);
    returnToSender(ctx, { defaultPath: 'http://localhost:8080/default' });
    assertEquals(getRedirect(), 'http://localhost:8080/default');
});

Deno.test('returnToSender appends search params to the redirect URL', () => {
    const { ctx, getRedirect } = makeCtx('http://localhost:8080/folder');
    returnToSender(ctx, { search: { error: 'not_found' } });
    const url = new URL(getRedirect());
    assertEquals(url.searchParams.get('error'), 'not_found');
});

Deno.test('returnToSender overwrites existing search params in the Referer URL', () => {
    const { ctx, getRedirect } = makeCtx('http://localhost:8080/folder?error=old');
    returnToSender(ctx, { search: { error: 'new_value' } });
    const url = new URL(getRedirect());
    assertEquals(url.searchParams.get('error'), 'new_value');
});
