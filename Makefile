.PHONY: all run test

run:
	deno run --allow-all src/main.ts


test:
	curl -v localhost:8080