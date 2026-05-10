#!/bin/bash

VER="${GO_DL_VERSION:-1.26.2}"
GO_DL_URL="https://go.dev/dl/go$VER.linux-amd64.tar.gz"
TAR_NAME="go$VER.linux-amd64.tar.gz"
OUTPUT_PATH="./data/vendor/$TAR_NAME"
mkdir -p ./data/vendor

if [[ -f "$OUTPUT_PATH" ]];
then
    echo "Go already downloaded to data/vendor"
    exit 0
fi

wget -O $OUTPUT_PATH $GO_DL_URL 
