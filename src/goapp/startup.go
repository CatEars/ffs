package main

import (
	"catears/ffs/goapp/cache"
	"catears/ffs/goapp/config"
	"catears/ffs/goapp/disks"
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
	env := config.Config.Env()
	if env == "" {
		config.Config.SetConfig("FFS_ENV", "dev")
	}

	if config.Config.DevMode() {
		config.Config.SetConfig("FFS_USERS_FILE", path.Join("..", "data", "users-file.json"))
	}

	storeRoot := config.Config.StoreRoot()
	if storeRoot == "" {
		config.Config.SetConfig("FFS_STORE_ROOT", d)
	}

	cacheDir := config.Config.CacheRoot()
	if cacheDir == "" {
		dir, err := resolveCacheFolder()
		if err != nil {
			panic(err)
		}
		config.Config.SetConfig("FFS_CACHE_ROOT", dir)
	}
	cache.InitializeCacheFolders()

	disks.InitializeDisks(disks.NewPhysicalDisk(config.Config.StoreRoot()))
}
