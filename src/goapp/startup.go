package main

import (
	"catears/ffs/goapp/cache"
	"catears/ffs/goapp/config"
	appdisks "catears/ffs/goapp/disks"
	"catears/ffs/goapp/uploading"
	bookingstore "catears/ffs/lib/booking-store"
	"catears/ffs/lib/disks"
	"log"
	"os"
	"path"
	"path/filepath"
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
		cwd, err := os.Getwd()
		if err != nil {
			panic(err)
		}
		err = os.Chdir(filepath.Dir(cwd))
		if err != nil {
			panic(err)
		}
		config.Config.SetConfig("FFS_USERS_FILE", path.Join("data", "users-file.json"))
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

	appdisks.InitializeDisks(disks.NewPhysicalDisk(config.Config.StoreRoot()))
	uploadDisk, err := cache.UploadFolder.Get()
	if err != nil {
		panic(err)
	}
	uploading.InitUploadStore(bookingstore.New(uploadDisk))
}
