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

	out, err := cmd.CombinedOutput()
	if err != nil {
		log.Panicf("Bundle failed %s\nError: %v", string(out), err)
	}
}

func bundleJavascriptWebcomponents(silent bool) {
	EnsureDirFromCwd("src", "goapp", "website", "static", "js")
	args := []string{
		"--bundle",
		"index.js",
		"--outfile=../static/js/index.bundle.js",
	}
	dir := path.Join(GetCwdOrFail(), "src", "goapp", "website", "components")
	runWithEsbuild(dir, args)
	if !silent {
		log.Println("Bundled component library into index.bundle.js")
	}
}

func bundleCss(silent bool) {
	args := []string{
		"--bundle",
		"index.css",
		"--loader:.svg=dataurl",
		"--outfile=index.bundle.css",
	}
	dir := path.Join(GetCwdOrFail(), "src", "goapp", "website", "static", "css")
	runWithEsbuild(dir, args)
	if !silent {
		log.Println("Bundling CSS files into index.bundle.css")
	}
}

func BundleComponentLibrarySilently() {
	bundleJavascriptWebcomponents(true)
	bundleCss(true)
}

func BundleComponentLibrary() {
	bundleJavascriptWebcomponents(false)
	bundleCss(false)
}
