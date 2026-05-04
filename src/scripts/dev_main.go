package main

import (
	"log"
	"os"
	"os/exec"
	"path"
	"time"
)

func autoRecover(fn func()) {
	defer func() {
		if r := recover(); r != nil {
			log.Printf("Panic caught: %v\n", r)
		}
	}()
	fn()
}

func DevMain() {
	os.Setenv("FFS_ENV", "dev")
	os.Setenv("FFS_STORE_ROOT", ".")
	os.Setenv("FFS_USERS_FILE", "data/users-file.json")
	os.Setenv("FFS_CUSTOM_COMMANDS_FILE", "data/sample-custom-commands.json")
	os.Setenv("FFS_INSTANCE_SECRET", "VerySecretIndeed")
	os.Setenv("FFS_THUMBNAIL_FINDER_SKIP_REGEX", "(test_no_thumbnails_images|\\.no_thumbnail\\.)")

	go func() {
		bundleTicker := time.NewTicker(time.Second * 2)
		for {
			autoRecover(BundleComponentLibrarySilently)
			<-bundleTicker.C
		}
	}()

	cmd := exec.Command("deno", "--allow-all", path.Join("src", "app", "main.ts"))
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	err := cmd.Run()
	Fatal(err)
}
