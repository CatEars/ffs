import { Router } from '@oak/oak';
import { baseMiddlewares } from '../base-middlewares.ts';
import { apiProtect } from '../security/api-protect.ts';
import { HTTP_200_OK, HTTP_400_BAD_REQUEST } from '../utils/http-codes.ts';
import { logger } from '../logging/logger.ts';
import { getCustomCommands } from './custom-command.ts';

export function registerCommandsApi(router: Router) {
    logger.info('Registering /api/custom-commands/*');

    const commands = getCustomCommands();

    router.get('/api/custom-commands', baseMiddlewares(), apiProtect, (ctx) => {
        ctx.response.body = commands;
    });

    if (commands.length === 0) {
        logger.info("No custom commands registered. Won't register POST route");
        return;
    }

    router.post(
        '/api/custom-commands/run',
        baseMiddlewares(),
        apiProtect,
        async (ctx) => {
            const body = await ctx.request.body.json();
            const id = body['id'];
            const args = body['args'];
            if (
                id === undefined || typeof id !== 'number' || args === undefined ||
                typeof args !== 'object'
            ) {
                ctx.response.status = HTTP_400_BAD_REQUEST;
                return;
            }

            const command = commands[id];
            if (!command) {
                ctx.response.status = HTTP_400_BAD_REQUEST;
                return;
            }

            let computedArgs = command.args.map((x) => x);
            for (let idx = 1; idx <= command.nargs; ++idx) {
                const elem = `${args[idx - 1]}`;
                const replacer = `$${idx}`;
                computedArgs = computedArgs.map((x) => x === replacer ? elem : x);
            }

            const result = new Deno.Command(command.program, {
                args: computedArgs,
            });
            logger.info(
                'Running command',
                `\`${command.program} ${computedArgs.join(' ')}\``,
            );
            const { stdout } = result.outputSync();

            ctx.response.status = HTTP_200_OK;
            ctx.response.body = new TextDecoder().decode(stdout);
        },
    );
}
