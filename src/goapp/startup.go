package main

import (
	"catears/ffs/goapp/cache"
	"catears/ffs/goapp/config"
	appdisks "catears/ffs/goapp/disks"
	"catears/ffs/goapp/thumbnails"
	"catears/ffs/goapp/uploading"
	bookingstore "catears/ffs/lib/booking-store"
	"catears/ffs/lib/disks"
	"context"
	"log"
	"os"
	"path"
	"path/filepath"
	"strings"
	"sync"
	"time"
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

var thumbnailWaitDuration time.Duration = time.Second * 5

func InfinitelyRunThumbnailBackgroundProcess(ctx context.Context) {
	log.Println("Starting thumbnail generator")
	wg := sync.WaitGroup{}
	thumbnails.InitThumbnailThreads(ctx, 3, &wg)
	for {
		select {
		case <-ctx.Done():
			wg.Wait()
			return
		default:
			thumbnails.FindAndProduceThumbnails()
			select {
			case <-ctx.Done():
				wg.Wait()
				return
			case <-time.After(thumbnailWaitDuration):
				continue
			}
		}
	}
}

func RunStartup(ctx context.Context) {
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

		thumbnailWaitDuration = time.Second * 45
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

	go InfinitelyRunThumbnailBackgroundProcess(ctx)
}
