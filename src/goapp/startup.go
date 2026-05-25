package main

import (
	"catears/ffs/goapp/cache"
	"catears/ffs/goapp/config"
	"log"
	"os"
	"path"
)

func RunStartup() {
	d, _ := os.Getwd()
	log.Printf("Starting go-app from %s", d)
	config.Config.SetConfig("FFS_USERS_FILE", path.Join("data", "users-file.json"))
	config.Config.SetConfig("FFS_ENV", "dev")
	config.Config.CacheRoot()
	dir, err := cache.ResolveCacheFolder()
	if err != nil {
		panic(err)
	}
	config.Config.SetConfig("FFS_CACHE_ROOT", dir)
}
