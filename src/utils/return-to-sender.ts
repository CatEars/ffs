import { Context } from '@oak/oak/context';

interface ReturnToSenderOptions {
    search?: Record<string, string>;
}

export function returnToSender(ctx: Context, options?: ReturnToSenderOptions) {
    const referer = ctx.request.headers.get('Referer') || '/';

    const redirectUrl = new URL(referer);

    if (options?.search) {
        for (const [key, value] of Object.entries(options.search)) {
            redirectUrl.searchParams.set(key, value);
        }
    }

    ctx.response.redirect(redirectUrl.href);
}
