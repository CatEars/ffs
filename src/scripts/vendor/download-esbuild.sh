#!/bin/bash
curl -fsSL https://esbuild.github.io/dl/latest | sh
mv esbuild src/scripts/vendor/bin
chmod +x src/scripts/vendor/bin/esbuild
