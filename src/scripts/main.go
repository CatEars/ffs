package main

import "flag"

func main() {
	dl := flag.Bool("download-deps", false, "Download dependencies")

	flag.Parse()

	if *dl {
		DownloadDependencies()
	} else {
		flag.Usage()
	}
}