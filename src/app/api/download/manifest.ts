import { Router } from '@oak/oak';
import { basename } from '@std/path/basename';
import { dirname } from '@std/path/dirname';
import { HTTP_400_BAD_REQUEST, HTTP_404_NOT_FOUND } from '../../../lib/http/http-codes.ts';
import { baseMiddlewares, protectedMiddlewares } from '../../base-middlewares.ts';
import { DownloadManifest, FileDescriptorForManifest } from '../../download/manifest-types.ts';
import { manifestRegistry } from '../../download/manifest.ts';

function filterManifestForApi(manifest: DownloadManifest) {
    return {
        id: manifest.id,
        mode: manifest.mode,
        files: manifest.files.map((f) => ({
            name: f.name,
            directory: f.rootRelativeDirectoryPath,
            size: f.size,
            isFile: f.isFile,
            isDirectory: f.isDirectory,
        })),
    };
}

export function register(router: Router) {
    router.get(
        '/api/download/manifest',
        baseMiddlewares(),
        ...protectedMiddlewares(),
        async (ctx) => {
            const id = ctx.request.url.searchParams.get('id');
            if (!id) {
                ctx.response.status = HTTP_400_BAD_REQUEST;
                return;
            }

            const manifest = await manifestRegistry.getManifest(id);
            if (!manifest) {
                ctx.response.status = HTTP_404_NOT_FOUND;
                return;
            }

            ctx.response.body = filterManifestForApi(manifest);
        },
    );

    router.post(
        '/api/download/manifest',
        baseMiddlewares(),
        ...protectedMiddlewares(),
        async (ctx) => {
            const formData = await ctx.request.body.formData();
            const filePaths = formData.getAll('file');
            const filesForManifest: FileDescriptorForManifest[] = [];
            for (const filePath of filePaths) {
                const fullPath = filePath.toString();
                const pathResult = await ctx.state.fileTree.resolvePath(fullPath);
                if (pathResult.type === 'valid' && pathResult.exists) {
                    const stat = await Deno.stat(pathResult.fullPath);
                    filesForManifest.push({
                        name: basename(pathResult.fullPath),
                        directoryPath: dirname(pathResult.fullPath),
                        rootRelativeDirectoryPath: dirname(fullPath),
                        size: stat.size,
                        isFile: stat.isFile,
                        isDirectory: stat.isDirectory,
                    });
                }
            }
            const manifest = await manifestRegistry.generateManifest(filesForManifest);
            ctx.response.redirect(`/download/?id=${manifest.id}`);
        },
    );
}
