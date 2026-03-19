import { Router } from '@oak/oak';
import { walk } from '@std/fs/walk';
import { relative } from '@std/path/relative';
import { resolve } from '@std/path/resolve';
import { Logger } from '../logger/logger.ts';

export type RegistrationFunction = (router: Router) => Promise<void>;

export async function findRouteRegistrationsInFileTree(rootPath: string, logger: Logger) {
    const absoluteRootPath = resolve(rootPath);
    const results: RegistrationFunction[] = [];
    for await (
        const entry of walk(absoluteRootPath, {
            exts: ['ts'],
            includeFiles: true,
            includeDirs: false,
            includeSymlinks: false,
        })
    ) {
        const rootRelativePath = relative(absoluteRootPath, entry.path);
        try {
            const mod = await import(entry.path);
            for (const [memberName, exportedMember] of Object.entries(mod)) {
                if (memberName.startsWith('register') && typeof exportedMember === 'function') {
                    results.push(async (router: Router) => {
                        logger.log(
                            'Registering',
                            `${rootRelativePath.padEnd(27)} --> ${memberName}()`,
                        );
                        const res = exportedMember(router);
                        if (res instanceof Promise) {
                            await res;
                        }
                    });
                }
            }
        } catch (err) {
            logger.warn('Unable to import', rootRelativePath, 'Error:', err);
        }
    }
    return results;
}
