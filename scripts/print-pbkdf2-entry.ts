import { randomUUID } from 'node:crypto';
import { pbkdf2Hash } from '../src/security/password-hash.ts';

const username = Deno.args[0];
const password = Deno.args[1];
const salt = randomUUID();
const b64Hash = pbkdf2Hash(password, salt);
console.log(JSON.stringify(
    {
        type: 'pbkdf2',
        username,
        b64Hash,
        salt,
        key: randomUUID(),
    },
    null,
    2,
));
