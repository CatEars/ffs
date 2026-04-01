import { Router } from '@oak/oak/router';
import { HTTP_400_BAD_REQUEST } from '../../../lib/http/http-codes.ts';
import { baseMiddlewares, protectedMiddlewares } from '../../base-middlewares.ts';
import { csrfProtect } from '../../security/csrf-protect.ts';
import { shareLinkSchemeRegistry } from '../../share-file/share-link-scheme-registry.ts';
import { generateSignedCode } from '../../share-file/share-protect.ts';

export function register(router: Router) {
    router.post(
        '/api/link',
        baseMiddlewares(),
        ...protectedMiddlewares(),
        csrfProtect,
        async (ctx) => {
            const form = await ctx.request.body.formData();
            const paths = JSON.parse(form.get('paths')?.toString() || '');
            const shareCtx = { paths };
            if (!await shareLinkSchemeRegistry.isAvailable(shareCtx)) {
                ctx.response.status = HTTP_400_BAD_REQUEST;
                return;
            }
            const pathCode = await shareLinkSchemeRegistry.createCode(shareCtx);
            const code = await generateSignedCode(pathCode);
            ctx.response.redirect(`/share-file/view?code=${code}`);
        },
    );
}
