import { Router } from '@oak/oak';
import { baseMiddlewares, protectedMiddlewares } from '../base-middlewares.ts';
import {
    HTTP_400_BAD_REQUEST,
    HTTP_403_FORBIDDEN,
    HTTP_404_NOT_FOUND,
} from '../utils/http-codes.ts';
import { join } from '@std/path/join';
import { dirname } from '@std/path/dirname';
import { move } from '@std/fs/move';

export function registerRenameFileRoute(router: Router) {
    router.post('/api/file/rename', baseMiddlewares(), ...protectedMiddlewares(), async (ctx) => {
        const fileTree = ctx.state.fileTree;
        const form = await ctx.request.body.formData();

        const fileToRename = form.get('source');
        const targetName = form.get('target');

        if (!fileToRename || !targetName) {
            ctx.response.status = HTTP_400_BAD_REQUEST;
            ctx.response.body = { error: 'Missing file or target name' };
            return;
        }

        const source = fileToRename.toString();
        const target = join(dirname(source), targetName.toString());

        const from = fileTree.resolvePath(source);
        const to = fileTree.resolvePath(target);

        if (from.type === 'invalid' || to.type === 'invalid') {
            ctx.response.status = HTTP_404_NOT_FOUND;
            ctx.response.body = { error: `Invalid directory` };
            return;
        }

        if (to.exists) {
            ctx.response.status = HTTP_403_FORBIDDEN;
            ctx.response.body = { error: `A file with that name already exists` };
            return;
        }

        await move(from.fullPath, to.fullPath);
        ctx.response.redirect(ctx.request.headers.get('Referer')?.toString() || '/home');
    });
}
