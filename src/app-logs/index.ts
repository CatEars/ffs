import { Router } from '@oak/oak';
import { registerGetAppLogEndpoint } from './get-app-logs.ts';

export function registerAllAppLogsEndpoints(router: Router) {
    registerGetAppLogEndpoint(router);
}
