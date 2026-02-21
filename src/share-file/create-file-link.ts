import { Router } from '@oak/oak/router';
import { baseMiddlewares, protectedMiddlewares } from '../base-middlewares.ts';
import { generateSignatureForCode } from './share-protect.ts';
import { shareLinkSchemeRegistry } from './share-link-scheme-registry.ts';
import { HTTP_400_BAD_REQUEST } from '../utils/http-codes.ts';

export function registerCreateFileShareLink(router: Router) {
    router.post('/api/link', baseMiddlewares(), ...protectedMiddlewares(), async (ctx) => {
        const form = await ctx.request.body.formData();
        const paths = JSON.parse(form.get('paths')?.toString() || '');
        const shareCtx = { paths };
        if (!shareLinkSchemeRegistry.isAvailable(shareCtx)) {
            ctx.response.status = HTTP_400_BAD_REQUEST;
            return;
        }
        const code = shareLinkSchemeRegistry.createCode(shareCtx);
        const signature = await generateSignatureForCode(code);
        ctx.response.redirect(`/share-file/view?code=${code}&signature=${signature}`);
    });
}
