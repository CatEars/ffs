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
        const data = await ctx.request.body.form();
        const username = data.get('username');
        const password = data.get('password');
        if (!username || !password) {
            ctx.response.status = HTTP_400_BAD_REQUEST;
            return;
        }

        const matchingUser = await getMatchingUser(username, password);

        if (!matchingUser) {
            ctx.response.redirect('/logon/fail');
            return;
        }

        ctx.cookies.set('FFS-Authorization', matchingUser);
        ctx.response.redirect('/home/');
    });
}
