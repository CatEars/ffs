import { Router } from '@oak/oak/router';
import { baseMiddlewares } from '../../base-middlewares.ts';

export function register(router: Router) {
    router.get('/logout', baseMiddlewares(), (ctx) => {
        ctx.cookies.delete('FFS-Authorization');
        ctx.response.redirect('/');
    });
}
