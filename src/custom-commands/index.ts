import { Router } from '@oak/oak';
import { registerCommandsApi } from './commands-api.ts';

export function registerAllCustomCommandApi(router: Router) {
    registerCommandsApi(router);
}
