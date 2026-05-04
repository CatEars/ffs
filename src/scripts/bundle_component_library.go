package main

import (
	"log"
	"os/exec"
	"path"
)

func runWithEsbuild(dir string, args []string) {
	cwd := GetCwdOrFail()
	esbuildPath := path.Join(cwd, "src", "scripts", "vendor", "bin", "esbuild")
	cmd := exec.Command(esbuildPath, args...)
	cmd.Dir = dir

	err := cmd.Run()
	Fatal(err)
}

func bundleJavascriptWebcomponents() {
	EnsureDirFromCwd("src", "app", "website", "static", "js")
	args := []string{
		"--bundle",
		"index.js",
		"--outfile=../static/js/index.bundle.js",
	}
	dir := path.Join(GetCwdOrFail(), "src", "app", "website", "components")
	runWithEsbuild(dir, args)
	log.Println("Bundled component library into index.bundle.js")
}

func bundleCss() {
	args := []string{
		"--bundle",
		"index.css",
		"--loader:.svg=dataurl",
		"--outfile=index.bundle.css",
	}
	dir := path.Join(GetCwdOrFail(), "src", "app", "website", "static", "css")
	runWithEsbuild(dir, args)
	log.Println("Bundling CSS files into index.bundle.css")
}

func BundleComponentLibrary() {
	bundleJavascriptWebcomponents()
	bundleCss()
}
