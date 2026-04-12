import { baseUrl } from './constants.ts';
import './init-test-config.ts';

let cachedApiKey: string | null = null;

async function getApiKey(): Promise<string> {
    if (cachedApiKey) {
        return cachedApiKey;
    }
    const result = await fetch(baseUrl + '/api/logon', {
        method: 'POST',
        body: JSON.stringify({ username: 'admin', password: 'ffsadmin' }),
        headers: { 'Content-Type': 'application/json' },
    });
    const response = await result.json();
    if (!response.isOk || !response.key) {
        throw new Error('Failed to log in during test setup');
    }
    cachedApiKey = response.key;
    return cachedApiKey;
}

export async function authenticatedFetch(
    url: string,
    opts: RequestInit | undefined = undefined,
): Promise<Response> {
    const apiKey = await getApiKey();
    if (opts === undefined) {
        opts = {};
    }

    if (!opts.headers) {
        opts.headers = {
            'Authorization': `FFS ${apiKey}`,
        };
    } else {
        opts.headers = {
            'Authorization': `FFS ${apiKey}`,
            ...opts.headers,
        };
    }

    return fetch(url, opts);
}
