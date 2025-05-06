.PHONY: all run test

run:
	deno run --allow-all src/main.ts


test:
	deno test --allow-all
