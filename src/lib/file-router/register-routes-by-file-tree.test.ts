import { assertEquals } from '@std/assert/equals';
import { assert } from '@std/assert/assert';
import { findRouteRegistrationsInFileTree } from './register-routes-by-file-tree.ts';
import type { Logger } from '../logger/logger.ts';

const silentLogger: Logger = {
    debug: () => {},
    log: () => {},
    warn: () => {},
};

Deno.test(
    'findRouteRegistrationsInFileTree returns an empty array for an empty directory',
    async () => {
        const tempDir = await Deno.makeTempDir();
        const results = await findRouteRegistrationsInFileTree(tempDir, silentLogger);
        assertEquals(results, []);
        await Deno.remove(tempDir);
    },
);

Deno.test(
    'findRouteRegistrationsInFileTree returns an empty array when no register* exports are found',
    async () => {
        const tempDir = await Deno.makeTempDir();
        await Deno.writeTextFile(tempDir + '/no-register.ts', 'export const helper = () => {};');
        const results = await findRouteRegistrationsInFileTree(tempDir, silentLogger);
        assertEquals(results.length, 0);
        await Deno.remove(tempDir, { recursive: true });
    },
);

Deno.test(
    'findRouteRegistrationsInFileTree logs a warning for files that cannot be imported',
    async () => {
        const warnings: unknown[][] = [];
        const warnLogger: Logger = {
            debug: () => {},
            log: () => {},
            warn: (...args: unknown[]) => warnings.push(args),
        };
        const tempDir = await Deno.makeTempDir();
        await Deno.writeTextFile(tempDir + '/bad-syntax.ts', 'this is not valid typescript!!!@@@');
        await findRouteRegistrationsInFileTree(tempDir, warnLogger);
        assert(warnings.length > 0);
        await Deno.remove(tempDir, { recursive: true });
    },
);
