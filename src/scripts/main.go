package main

import "flag"

func main() {
	dl := flag.Bool("download-deps", false, "Download dependencies")
	personal := flag.Bool("create-personal-files", false, "Create personal files")

	flag.Parse()

	if *dl {
		DownloadDependencies()
	} else if *personal {
		CreatePersonalFiles()
	} else {
		flag.Usage()
	}
}