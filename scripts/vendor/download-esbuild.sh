#!/bin/bash
curl -fsSL https://esbuild.github.io/dl/latest | sh
mv esbuild scripts/vendor/bin
chmod +x scripts/vendor/bin/esbuild
