import { join } from '@std/path/join';
import { resolve } from '@std/path/resolve';

export function resolveUnder(filePath: string, root: string) {
    const resolvedPath = resolve(join(root, filePath));
    return resolvedPath.startsWith(resolve(root)) ? resolvedPath : null;
}
