#!/bin/bash

# TODO: Make this follow the same pattern as `download-bombardier` and `download-esbuild`

BIN_DIR="$HOME/.local/bin"

if [ -f "$BIN_DIR/mkcert" ]; then
    echo "mkcert already installed"
    exit 0
fi

pushd /tmp
git clone https://github.com/FiloSottile/mkcert && cd mkcert
go build -ldflags "-X main.Version=$(git describe --tags)"
cp mkcert $BIN_DIR
popd
