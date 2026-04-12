import { assert } from '@std/assert/assert';
import { baseUrl } from '../constants.ts';

Deno.test('Using the right username and password gets us the API key', async () => {
    const result = await fetch(baseUrl + '/api/logon', {
        method: 'POST',
        body: JSON.stringify({
            'username': 'admin',
            'password': 'ffsadmin',
        }),
        headers: {
            'Content-Type': 'application/json',
        },
    });
    const response = await result.json();
    assert(response['isOk']);
    assert(
        typeof response['key'] === 'string' && response['key'].length > 0,
        'Expected a non-empty API key string',
    );
});

Deno.test('Using the right username and password gets us the API key - pbkdf2', async () => {
    const result = await fetch(baseUrl + '/api/logon', {
        method: 'POST',
        body: JSON.stringify({
            'username': 'admin2',
            'password': 'ffsadmin',
        }),
        headers: {
            'Content-Type': 'application/json',
        },
    });
    const response = await result.json();
    assert(response['isOk']);
    assert(
        typeof response['key'] === 'string' && response['key'].length > 0,
        'Expected a non-empty API key string',
    );
});
