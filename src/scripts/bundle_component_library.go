package main

import (
	"log"
	"os"
	"os/exec"
	"path"
)

func bundleJavascriptWebcomponents() {
	cwd, err := os.Getwd()
	Fatal(err)
	outputDir := path.Join(cwd, "src", "app", "website", "static", "js")
	os.MkdirAll(outputDir, 0o777)
	args := []string{
		"--bundle",
		"index.js",
		"--outfile=../static/js/index.bundle.js",
	}
	esbuildPath := path.Join(cwd, "src", "scripts", "vendor", "bin", "esbuild")
	cmd := exec.Command(esbuildPath, args...)
	cmd.Dir = path.Join(cwd, "src", "app", "website", "components")

	err = cmd.Run()
	Fatal(err)
	log.Println("Bundled component library into index.bundle.js")
}

func bundleCss() {
	log.Println("Bundling css...")
}

func BundleComponentLibrary() {
	bundleJavascriptWebcomponents()
	bundleCss()
}
