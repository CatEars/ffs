import { Middleware } from '@oak/oak/middleware';
import { HTTP_401_UNAUTHORIZED } from '../../lib/http/http-codes.ts';
import { FfsApplicationState } from '../application-state.ts';

export const csrfProtect: Middleware<FfsApplicationState> = async (ctx, next) => {
    const csrfCookie = await ctx.cookies.get('FFS-Csrf-Protection');
    const csrfHeader = ctx.request.headers.get('FFS-Csrf-Protection');
    let csrfComparator = csrfHeader || '';

    if (ctx.request.hasBody && ['form', 'form-data'].includes(ctx.request.body.type())) {
        const formData = await ctx.request.body.formData();
        const csrfInput = formData.get('ffs_csrf_protection');
        csrfComparator = csrfInput?.toString() || '';
    }

    if (!csrfCookie || !csrfComparator || csrfCookie !== csrfComparator) {
        ctx.response.status = HTTP_401_UNAUTHORIZED;
        return;
    }

    await next();
};
