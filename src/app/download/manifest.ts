import { ensureDir } from '@std/fs/ensure-dir';
import { join } from '@std/path/join';
import { getDownloadManifestsDir } from '../files/cache-folder.ts';
import { logger } from '../logging/loggers.ts';
import { DownloadManifest, FileDescriptorForManifest } from './manifest-types.ts';

export interface DownloadManifestRegistry {
    generateManifest(files: FileDescriptorForManifest[]): Promise<DownloadManifest>;
    getManifest(manifestId: string): Promise<DownloadManifest | undefined>;
}

function determineMode(files: FileDescriptorForManifest[]): 'single' | 'archive' {
    return files.length === 1 ? 'single' : 'archive';
}

function generateManifest(files: FileDescriptorForManifest[]) {
    const uuid: string = crypto.randomUUID();
    const manifest = {
        id: uuid,
        mode: determineMode(files),
        files,
    };
    return manifest;
}

export class InMemoryManifestRegistry implements DownloadManifestRegistry {
    private readonly registry: Map<string, DownloadManifest> = new Map();
    generateManifest(files: FileDescriptorForManifest[]): Promise<DownloadManifest> {
        const manifest = generateManifest(files);
        this.registry.set(manifest.id, manifest);
        return Promise.resolve(manifest);
    }

    getManifest(manifestId: string): Promise<DownloadManifest | undefined> {
        return Promise.resolve(this.registry.get(manifestId));
    }
}

export class CacheFolderManifestRegistry implements DownloadManifestRegistry {
    async generateManifest(files: FileDescriptorForManifest[]): Promise<DownloadManifest> {
        const manifest = generateManifest(files);
        const manifestPath = await this.#ensureDirAndGetManifestPath(manifest.id);
        const jsonManifest = JSON.stringify(manifest);
        await Deno.writeTextFile(manifestPath, jsonManifest);
        return manifest;
    }

    async getManifest(manifestId: string): Promise<DownloadManifest | undefined> {
        const manifestPath = await this.#ensureDirAndGetManifestPath(manifestId);
        try {
            const fileContents = await Deno.readFile(manifestPath);
            const manifestContent = JSON.parse(new TextDecoder().decode(fileContents));
            return manifestContent as DownloadManifest;
        } catch (err) {
            logger.info('Unable to read manifests file', err);
            return undefined;
        }
    }

    async #ensureDirAndGetManifestPath(manifestId: string) {
        const downloadFolder = getDownloadManifestsDir();
        await ensureDir(downloadFolder);
        return join(downloadFolder, `${manifestId}.json`);
    }
}

export class LoggingManifestRegistry implements DownloadManifestRegistry {
    private readonly wrappedRegistry: DownloadManifestRegistry;
    constructor(wrappedRegistry: DownloadManifestRegistry) {
        this.wrappedRegistry = wrappedRegistry;
    }
    async generateManifest(files: FileDescriptorForManifest[]): Promise<DownloadManifest> {
        const manifest = await this.wrappedRegistry.generateManifest(files);
        logger.info('Generated manifest', manifest.id, 'for', manifest.files.length, 'files');
        return manifest;
    }
    getManifest(manifestId: string): Promise<DownloadManifest | undefined> {
        return this.wrappedRegistry.getManifest(manifestId);
    }
}

export const manifestRegistry = new LoggingManifestRegistry(new InMemoryManifestRegistry());
