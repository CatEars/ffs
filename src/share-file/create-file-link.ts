import { Router } from '@oak/oak/router';
import { encodeBase64Url } from '@std/encoding/base64url';
import { baseMiddlewares, protectedMiddlewares } from '../base-middlewares.ts';
import { generateHmacForFile as generateHmacForFiles } from './share-protect.ts';

export function registerCreateFileShareLink(router: Router) {
    router.post('/api/link', baseMiddlewares(), ...protectedMiddlewares(), async (ctx) => {
        const form = await ctx.request.body.formData();
        const paths = JSON.parse(form.get('paths')?.toString() || '');
        const hmac = await generateHmacForFiles(paths);
        const encodedPaths = encodeBase64Url(JSON.stringify(paths));
        ctx.response.redirect(`/share-file/view?paths=${encodedPaths}&hmac=${hmac}`);
    });
}
