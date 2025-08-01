import { Router } from '@oak/oak/router';
import { apiProtect } from '../security/api-protect.ts';
import { baseMiddlewares } from '../base-middlewares.ts';
import { generateHmacForFile as generateHmacForFiles } from '../security/share-protect.ts';

export function registerCreateFileShareLink(router: Router) {
    router.post('/api/link', baseMiddlewares(), apiProtect, async (ctx) => {
        const form = await ctx.request.body.formData();
        const paths = form.getAll('path').map((x) => x.toString());
        return await generateHmacForFiles(paths);
    });
}
