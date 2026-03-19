import { HTTPMethods, Router } from '@oak/oak';
import { baseMiddlewares } from '../../base-middlewares.ts';

export type ApiEndpointDefinition = {
    methods: HTTPMethods[];
    path: string;
};

export function register(router: Router) {
    router.get('/api/sitemap', baseMiddlewares(), (ctx) => {
        const values = router.values();
        const result: ApiEndpointDefinition[] = [];
        for (const val of values) {
            val.methods;
            result.push({
                methods: val.methods,
                path: val.path,
            });
        }
        ctx.response.body = result;
    });
}
