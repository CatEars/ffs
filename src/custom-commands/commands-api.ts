import { Router } from '@oak/oak';
import { baseMiddlewares, protectedMiddlewares } from '../base-middlewares.ts';
import { HTTP_400_BAD_REQUEST } from '../utils/http-codes.ts';
import { logger } from '../logging/logger.ts';
import { getCustomCommands } from './custom-command.ts';
import { returnToSender } from '../utils/return-to-sender.ts';

const decoder = new TextDecoder();

export function registerCommandsApi(router: Router) {
    logger.info('Registering /api/custom-commands/*');

    const commands = getCustomCommands();

    router.get('/api/custom-commands', baseMiddlewares(), ...protectedMiddlewares(), (ctx) => {
        ctx.response.body = commands;
    });

    if (commands.length === 0) {
        logger.info("No custom commands registered. Won't register POST route");
        return;
    }

    router.post(
        '/api/custom-commands/run',
        baseMiddlewares(),
        ...protectedMiddlewares(),
        async (ctx) => {
            const body = await ctx.request.body.formData();
            const idFromBody = body.get('index');
            const args = body.getAll('arg');
            if (
                idFromBody === undefined || typeof idFromBody !== 'string' ||
                typeof Number.parseInt(idFromBody) !== 'number' || args === undefined ||
                typeof args !== 'object'
            ) {
                ctx.response.status = HTTP_400_BAD_REQUEST;
                return;
            }

            const id = Number.parseInt(idFromBody);
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

            returnToSender(ctx, {
                search: {
                    message: decoder.decode(stdout),
                },
            });
        },
    );
}
