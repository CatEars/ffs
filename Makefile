.PHONY: all run test

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

build-docker:
	docker build . -t catears/ffs
