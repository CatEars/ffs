package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/exec"
	"path"
	"sync"
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
	ctx, cancel := context.WithCancel(context.Background())

	wd, err := os.Getwd()
	Fatal(err)

	oldCmd := exec.CommandContext(ctx, "deno", "--allow-all", path.Join("src", "app", "main.ts"))
	oldCmd.Stdout = os.Stdout
	oldCmd.Stderr = os.Stderr
	newCmd := exec.CommandContext(ctx, "go", "run", "./goapp")
	newCmd.Dir = path.Join(wd, "src")
	newCmd.Stdout = os.Stdout
	newCmd.Stderr = os.Stderr

	var waitGroup sync.WaitGroup
	waitGroup.Go(func() {
		err := oldCmd.Run()
		fmt.Printf("Deno app exited: %v\n", err)
		cancel()
	})
	waitGroup.Go(func() {
		err := newCmd.Run()
		fmt.Printf("Go app exited: %v\n", err)
		cancel()
	})
	go func() {
		bundleTicker := time.NewTicker(time.Second * 2)
		for {
			autoRecover(BundleComponentLibrarySilently)
			<-bundleTicker.C
		}
	}()
	waitGroup.Wait()
}
