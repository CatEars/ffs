.PHONY: all run test make-sure-tag-is-latest

ensure-dist:
	mkdir -p dist

run:
	FFS_ENV=dev FFS_STORE_ROOT=. FFS_USERS_FILE=data/users-file.json deno run --allow-all src/main.ts

run-nosec:
	FFS_ENV=dev FFS_ABANDON_SECURITY=true deno run --allow-all src/main.ts

test:
	deno test --allow-all

download-dependencies:
	deno run --allow-all scripts/download-deps.ts

unpack-favicon:
	deno run --allow-all scripts/unpack-favicon.ts
	
setup: download-dependencies unpack-favicon

build-docker: ensure-dist
	docker build . -t catears/ffs

build-dist: build-docker
	rm -rf dist/*
	docker save catears/ffs | gzip > dist/ffs.$(shell git describe --tags --abbrev=0).tar.gz

make-sure-tag-is-latest:
	read -p 'Please enter the tag you think you are releasing ' tag

release: make-sure-tag-is-latest build-dist
	./scripts/create-github-release.sh

pack-plugins:
	./scripts/pack-plugins.sh
