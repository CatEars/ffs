#!/bin/bash

BIN_DIR="$HOME/.local/bin"

pushd /tmp
git clone https://github.com/FiloSottile/mkcert && cd mkcert
go build -ldflags "-X main.Version=$(git describe --tags)"
cp mkcert $BIN_DIR
popd
