package main

import (
	"catears/ffs/goapp/appmiddlewares"
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
	appmiddlewares.BuildMiddlewares()
}
