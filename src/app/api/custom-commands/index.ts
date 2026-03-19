import { Router } from '@oak/oak';
import { baseMiddlewares, protectedMiddlewares } from '../../base-middlewares.ts';
import { getCustomCommands } from '../../custom-commands/custom-command.ts';

export function register(router: Router) {
    const commands = getCustomCommands();

    router.get('/api/custom-commands', baseMiddlewares(), ...protectedMiddlewares(), (ctx) => {
        ctx.response.body = commands;
    });
}
