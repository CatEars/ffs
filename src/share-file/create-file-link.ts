import { Router } from '@oak/oak/router';
import { apiProtect } from '../security/api-protect.ts';
import { baseMiddlewares } from '../base-middlewares.ts';
import { generateHmacForFile as generateHmacForFiles } from '../security/share-protect.ts';
import { encodeBase64Url } from 'jsr:@std/encoding@^1.0.10/base64url';

export function registerCreateFileShareLink(router: Router) {
    router.post('/api/link', baseMiddlewares(), apiProtect, async (ctx) => {
        const form = await ctx.request.body.formData();
        const paths = JSON.parse(form.get('paths')?.toString() || '');
        const hmac = await generateHmacForFiles(paths);
        const encodedPaths = encodeBase64Url(JSON.stringify(paths));
        ctx.response.redirect(`/share-file/view?paths=${encodedPaths}&hmac=${hmac}`);
    });
}
