package main

import (
	"os"
	"os/exec"
	"path"
)

var source = path.Join("data", "favicon_io.tar.xz")
var dest = path.Join("src", "goapp", "website", "static")

func UnpackFavicon() {
	cmd := exec.Command("tar", "-xJf", source, "-C", dest)
	err := cmd.Run()
	Fatal(err)
	os.Remove(path.Join(dest, "about.txt"))
}
