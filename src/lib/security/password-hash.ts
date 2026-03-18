import { pbkdf2Sync } from 'node:crypto';

export function pbkdf2Hash(password: string, salt: string) {
    const encodedPassword = new TextEncoder().encode(password);
    const result = pbkdf2Sync(encodedPassword, salt, 1000000, 64, 'sha512');
    return result.toString('base64');
}
