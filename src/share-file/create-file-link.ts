import { Router } from '@oak/oak/router';
import { baseMiddlewares, protectedMiddlewares } from '../base-middlewares.ts';
import { generateSignedCode } from './share-protect.ts';
import { shareLinkSchemeRegistry } from './share-link-scheme-registry.ts';
import { HTTP_400_BAD_REQUEST, HTTP_403_FORBIDDEN } from '../utils/http-codes.ts';

export function registerCreateFileShareLink(router: Router) {
    router.post('/api/link', baseMiddlewares(), ...protectedMiddlewares(), async (ctx) => {
        if (!ctx.state.userPermissions?.allowHousekeeping) {
            ctx.response.status = HTTP_403_FORBIDDEN;
            ctx.response.body = { error: 'Share link creation is not allowed for this user' };
            return;
        }
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
    });
}
