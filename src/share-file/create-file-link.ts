import { Router } from '@oak/oak/router';
import { baseMiddlewares, protectedMiddlewares } from '../base-middlewares.ts';
import { generateHmacForFile as generateHmacForFiles } from './share-protect.ts';
import { pathsShareLinkProtocol } from './paths-share-link-protocol.ts';
import { HTTP_400_BAD_REQUEST } from '../utils/http-codes.ts';

export function registerCreateFileShareLink(router: Router) {
    router.post('/api/link', baseMiddlewares(), ...protectedMiddlewares(), async (ctx) => {
        const form = await ctx.request.body.formData();
        const paths = JSON.parse(form.get('paths')?.toString() || '');
        const shareCtx = { paths };
        if (!pathsShareLinkProtocol.isAvailable(shareCtx)) {
            ctx.response.status = HTTP_400_BAD_REQUEST;
            return;
        }
        const hmac = await generateHmacForFiles(paths);
        const code = pathsShareLinkProtocol.createCode(shareCtx);
        ctx.response.redirect(`/share-file/view?paths=${code}&hmac=${hmac}`);
    });
}
