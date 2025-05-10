.PHONY: all run test

run:
	FFS_ENV=dev deno run --allow-all src/main.ts

run-nosec:
	FFS_ENV=dev FFS_ABANDON_SECURITY=true deno run --allow-all src/main.ts

test:
	deno test --allow-all

setup:
	deno run --allow-all scripts/download-deps.ts