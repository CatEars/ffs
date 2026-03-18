import { expandGlob } from '@std/fs/expand-glob';

for await (const entry of expandGlob('**/*.personal.*', { root: 'src' })) {
    if (entry.isFile) {
        await Deno.remove(entry.path);
        console.log(`Removed: ${entry.path}`);
    }
}
