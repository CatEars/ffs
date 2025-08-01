import { testApiKey } from './constants.ts';
import './init-test-config.ts';

export function authenticatedFetch(
    url: string,
    opts: RequestInit | undefined = undefined,
): Promise<Response> {
    if (opts === undefined) {
        opts = {};
    }

    if (!opts.headers) {
        opts.headers = {
            'Authorization': `FFS ${testApiKey}`,
        };
    } else {
        opts.headers = {
            'Authorization': `FFS ${testApiKey}`,
            ...opts.headers,
        };
    }

    return fetch(url, opts);
}
