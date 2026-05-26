package main

import (
	"catears/ffs/goapp/cache"
	"catears/ffs/goapp/config"
	"log"
	"os"
	"path"
	"strings"
)

func resolveCacheFolder() (string, error) {
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

func RunStartup() {
	d, _ := os.Getwd()
	log.Printf("Starting go-app from %s", d)
	config.Config.SetConfig("FFS_USERS_FILE", path.Join("data", "users-file.json"))
	config.Config.SetConfig("FFS_ENV", "dev")
	config.Config.CacheRoot()
	dir, err := resolveCacheFolder()
	if err != nil {
		panic(err)
	}
	config.Config.SetConfig("FFS_CACHE_ROOT", dir)
	cache.InitializeCacheFolders()
}
