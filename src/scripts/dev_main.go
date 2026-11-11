package main

import (
	"context"
	"fmt"
	"io"
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

func syncFile(destination, source string) {
	src, err := os.Open(source)
	if err != nil {
		return
	}

	os.Remove(destination)
	dest, err := os.Create(destination)
	if err != nil {
		return
	}

	io.Copy(dest, src)
}

var ffsTempDir string = path.Join(os.TempDir(), "ffs-dev-data")

func tempPath(filename string) string {
	return path.Join(ffsTempDir, filename)
}

func envOrDefault(key, defaultValue string) string {
	val := os.Getenv(key)
	if val == "" {
		return defaultValue
	}
	return val
}

func setEnvOrDefault(key, defaultValue string) {
	os.Setenv(key, envOrDefault(key, defaultValue))
}

func DevMain() {
	os.MkdirAll(ffsTempDir, 0o755)

	syncFile(tempPath("users-file.json"), "data/users-file.json")
	syncFile(tempPath("dev-cert.key.pem"), "data/dev-cert.key.pem")
	syncFile(tempPath("dev-cert.pem"), "data/dev-cert.pem")
	setEnvOrDefault("FFS_ENV", "dev")
	setEnvOrDefault("FFS_STORE_ROOT", ".")
	setEnvOrDefault("FFS_USERS_FILE", tempPath("users-file.json"))
	setEnvOrDefault("FFS_INSTANCE_SECRET", "VerySecretIndeed")
	setEnvOrDefault("FFS_THUMBNAIL_FINDER_SKIP_REGEX", "(test_no_thumbnails_images|\\.no_thumbnail\\.)")
	setEnvOrDefault("FFS_CERT_FILE", tempPath("dev-cert.pem"))
	setEnvOrDefault("FFS_CERT_KEY_FILE", tempPath("dev-cert.key.pem"))
	ctx, cancel := context.WithCancel(context.Background())

	wd, err := os.Getwd()
	Fatal(err)

	generateAutoImportCmd := exec.Command("sh", "-c", "goscript --generate-auto-import")
	err = generateAutoImportCmd.Run()
	Fatal(err)

	newCmd := exec.CommandContext(ctx, "go", "run", "./goapp")
	newCmd.Dir = path.Join(wd, "src")
	newCmd.Stdout = os.Stdout
	newCmd.Stderr = os.Stderr

	var waitGroup sync.WaitGroup
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
