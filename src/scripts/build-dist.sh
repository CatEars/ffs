#!/bin/bash
set -eux

THIS_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$THIS_SCRIPT_DIR/../.."

rm -f "$ROOT_DIR"/dist/*.tar.gz

echo "Generating base archives..."
docker save catears/ffs:tiny | gzip > "$ROOT_DIR/dist/ffs.latest.tiny.tar.gz"
docker save catears/ffs | gzip > "$ROOT_DIR/dist/ffs.latest.tar.gz"

echo "Building Go binaries for major platforms..."
PLATFORMS=(
    "linux/amd64"
    "linux/arm64"
    "darwin/amd64"
    "darwin/arm64"
    "windows/amd64"
)

for PLATFORM in "${PLATFORMS[@]}"; do
    IFS="/" read -r GOOS GOARCH <<< "$PLATFORM"
    
    # Append .exe for Windows binaries
    BIN_NAME="ffs-${GOOS}-${GOARCH}"
    if [ "$GOOS" = "windows" ]; then
        BIN_NAME="${BIN_NAME}.exe"
    fi

    echo "Compiling for $GOOS/$GOARCH -> $BIN_NAME"
    CGO_ENABLED=0 GOOS="$GOOS" GOARCH="$GOARCH" go build \
        -C "$ROOT_DIR/src/goapp" \
        -trimpath \
        -ldflags="-s -w -buildid=" \
        -o "$ROOT_DIR/dist/$BIN_NAME"
        
done

echo "Successfully built Docker images for all tags on HEAD and compiled all Go binaries."