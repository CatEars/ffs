import { Router } from '@oak/oak/router';
import { forgeBanhammer } from '../../../lib/http/banhammer.ts';
import { HTTP_400_BAD_REQUEST } from '../../../lib/http/http-codes.ts';
import { baseMiddlewares } from '../../base-middlewares.ts';
import { getMatchingUser } from '../../security/users.ts';

const banhammer = forgeBanhammer({
    maximumRequestsBeforeTheBanhammerStrikesPerFiveSeconds: 10,
});

export function register(router: Router) {
    router.post('/api/user-logon', banhammer, baseMiddlewares(), async (ctx) => {
        const data = await ctx.request.body.formData();
        const username = data.get('username');
        const password = data.get('password');
        if (!username?.toString() || !password?.toString()) {
            ctx.response.status = HTTP_400_BAD_REQUEST;
            return;
        }

        const matchingUser = await getMatchingUser(username.toString(), password.toString());

        if (!matchingUser) {
            ctx.response.redirect('/logon/fail');
            return;
        }

        ctx.cookies.set('FFS-Authorization', matchingUser, {
            httpOnly: true,
        });
        ctx.cookies.set('FFS-Csrf-Protection', crypto.randomUUID(), {
            httpOnly: false,
        });
        ctx.response.redirect('/home/');
    });
}
