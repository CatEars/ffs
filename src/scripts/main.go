package main

import "flag"

func main() {
	dl := flag.Bool("download-deps", false, "Download dependencies")
	personal := flag.Bool("create-personal-files", false, "Create personal files")
	bundle := flag.Bool("bundle-component-library", false, "Bundle component library")
	devMain := flag.Bool("dev-main", false, "Start developing!")

	flag.Parse()

	if *dl {
		DownloadDependencies()
	} else if *personal {
		CreatePersonalFiles()
	} else if *bundle {
		BundleComponentLibrary()
	} else if *devMain {
		DevMain()
	} else {
		flag.Usage()
	}
}
