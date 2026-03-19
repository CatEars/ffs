import { Router } from '@oak/oak/router';
import { forgeBanhammer } from '../../../lib/http/banhammer.ts';
import { HTTP_404_NOT_FOUND } from '../../../lib/http/http-codes.ts';
import { baseMiddlewares } from '../../base-middlewares.ts';
import { getMatchingUser } from '../../security/users.ts';

const banhammer = forgeBanhammer({
    maximumRequestsBeforeTheBanhammerStrikesPerFiveSeconds: 10,
});

export function register(router: Router) {
    router.post('/api/logon', banhammer, baseMiddlewares(), async (ctx) => {
        const body = await ctx.request.body.json();
        if (!body.username || !body.password) {
            return;
        }

        const matchingUser = await getMatchingUser(body.username, body.password);
        if (!matchingUser) {
            ctx.response.status = HTTP_404_NOT_FOUND;
            return;
        }

        ctx.response.body = {
            'isOk': true,
            'key': matchingUser,
        };
    });
}
