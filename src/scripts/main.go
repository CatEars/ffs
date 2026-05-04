package main

import "flag"

func main() {
	dl := flag.Bool("download-deps", false, "Download dependencies")
	personal := flag.Bool("create-personal-files", false, "Create personal files")
	bundle := flag.Bool("bundle-component-library", false, "Bundle component library")

	flag.Parse()

	if *dl {
		DownloadDependencies()
	} else if *personal {
		CreatePersonalFiles()
	} else if *bundle {
		BundleComponentLibrary()
	} else {
		flag.Usage()
	}
}
