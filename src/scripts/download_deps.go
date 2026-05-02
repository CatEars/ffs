package main

import (
	"log"
)

type downloadTarget struct {
	url    string
	target string
}

var downloadTargets = []downloadTarget{
	{
		url:    "https://raw.githubusercontent.com/google/material-design-icons/refs/heads/master/LICENSE",
		target: "./src/app/website/static/material-design-icons-license.txt",
	},
	{
		url:    "https://esm.sh/preact@10.27.0/es2022/preact.mjs",
		target: "./src/app/website/components/vendor/preact.mjs",
	},
	{
		url:    "https://esm.sh/preact@10.27.0/es2022/preact.mjs.map",
		target: "./src/app/website/components/vendor/preact.mjs.map",
	},
	{
		url:    "https://esm.sh/htm@3.1.1/es2022/htm.mjs",
		target: "./src/app/website/components/vendor/htm.mjs",
	},
	{
		url:    "https://esm.sh/htm@3.1.1/es2022/htm.mjs.map",
		target: "./src/app/website/components/vendor/htm.mjs.map",
	},
}

func DownloadDependencies() {
	for _, dl := range downloadTargets {
		url := dl.url
		target := dl.target
		log.Println("Downloading", url, "into", target)
		err := DownloadFile(url, target)
		Fatal(err)
	}
}
