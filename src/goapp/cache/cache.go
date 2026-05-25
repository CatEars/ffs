package cache

import (
	"catears/ffs/goapp/config"
	"os"
	"path"
	"strings"
)

/**
const cachePrefix = 'ffs-cachedir-';
const SHARE_MANIFESTS_SUBDIR = 'share-manifests';
export const cacheRootKey = 'FFS_CACHE_ROOT';

export async function resolveCacheFolder() {
    const envEntry = Deno.env.get('FFS_CACHE_FOLDER');
    const prior: string | undefined = await priorTempDirectory();
    if (envEntry && (await Deno.stat(envEntry)).isDirectory) {
        return envEntry;
    } else if (prior) {
        return prior;
    } else {
        return await Deno.makeTempDir({ prefix: cachePrefix });
    }
}

export function getShareManifestsDir(): string {
    return join(getCacheRoot(), SHARE_MANIFESTS_SUBDIR);
}

export function getCacheRoot() {
    return getEnvValueOrThrow(cacheRootKey);
}

*/

func ClearManifestsDirAndEnsureExists() error {
	cacheRoot := config.Config.CacheRoot()
	if cacheRoot == "" {
		return nil
	}

	manifestsFolder := path.Join(cacheRoot, "share-manifests")
	err := os.RemoveAll(manifestsFolder)
	if err != nil {
		return err
	}
	return os.Mkdir(manifestsFolder, 0o770)
}

func ResolveCacheFolder() (string, error) {
	cacheRoot := config.Config.CacheRoot()
	if cacheRoot != "" {
		return cacheRoot, nil
	}

	entries, err := os.ReadDir(os.TempDir())
	if err != nil {
		return "", err
	}

	for _, entry := range entries {
		if strings.HasPrefix(entry.Name(), "ffs-cachedir-") {
			return path.Join(os.TempDir(), entry.Name()), nil
		}
	}

	return os.MkdirTemp("", "ffs-cachedir-*")
}
