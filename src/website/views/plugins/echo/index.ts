import { baseMiddlewares, protectedMiddlewares } from '../../../../base-middlewares.ts';
import { logger } from '../../../../logging/logger.ts';
import { ApplicationContext } from '../../../collect-all-pages.ts';

export const enabled = false;

export const middlewares = protectedMiddlewares();

export function register(context: ApplicationContext): Promise<void> {
    logger.info('Adding /plugins/echo navbar link');
    context.navbarLinks.push({
        webPath: '/plugins/echo/',
        displayText: 'Echo',
    });

    logger.info('Registering /api/echo');
    context.router.post(
        '/api/echo',
        baseMiddlewares(),
        ...protectedMiddlewares(),
        async (ctx) => {
            const body = await ctx.request.body.json();
            const response = body.message
                ? `Echo: ${body.message}`
                : 'Did you seriously type nothing?';
            ctx.response.body = {
                message: response,
            };
        },
    );

    return Promise.resolve();
}
