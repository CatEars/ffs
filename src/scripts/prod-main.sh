#!/bin/sh

# Helper runner while deno is being migrated to golang

deno --allow-all src/app/main.ts &
DENO_PID=$!
/app/ffs
kill $DENO_PID
