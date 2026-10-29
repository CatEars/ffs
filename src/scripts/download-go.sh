#!/bin/bash

VER="${GO_DL_VERSION:-1.27.3}"
PLAT="${GO_DL_PLATFORM:-linux-amd64}"
SHA="${GO_DL_SHA256:-'65efbc80fdc1fa2cd2631cad5b481777a68e8725f34e89f50fc6ac714e379b40'}"
GO_DL_URL="https://go.dev/dl/go$VER.$PLAT.tar.gz"
TAR_NAME="go$VER.$PLAT.tar.gz"
OUTPUT_PATH="./data/vendor/$TAR_NAME"
mkdir -p ./data/vendor

if [[ -f "$OUTPUT_PATH" ]];
then
    echo "Go already downloaded to data/vendor"
    exit 0
fi

wget -O $OUTPUT_PATH $GO_DL_URL 
ACTUAL_HASH=$(sha256sum $OUTPUT_PATH | awk '{print $1}')

if [[ "$ACTUAL_HASH" != "$SHA" ]];
then
    echo "SHA256 Value does not match expected value, make sure you copy it from the golang downloads page"
    rm $OUTPUT_PATH
    exit 1
fi
