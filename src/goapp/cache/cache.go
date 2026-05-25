package cache

import (
	"catears/ffs/goapp/config"
	"catears/ffs/lib/autofolder"
	"os"
	"path"
	"strings"
)

var cacheRootFolder *autofolder.AutoFolder = nil
var shareManifestsFolder *autofolder.AutoFolder = nil

func getCacheRootFolder() *autofolder.AutoFolder {
	if cacheRootFolder == nil {
		cacheRootFolder = autofolder.New(config.Config.CacheRoot(), autofolder.GroupAccess)
	}
	return cacheRootFolder
}

func ClearManifestsDirAndEnsureExists() error {
	if shareManifestsFolder == nil {
		shareManifestsFolder = getCacheRootFolder().Sub("share-manifests")
	}

	return shareManifestsFolder.Recreate()
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
