#!/bin/bash

THIS_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="$THIS_SCRIPT_DIR/.."

echo "Build Dir: $BUILD_DIR"
docker build $BUILD_DIR --no-cache -f "$BUILD_DIR/special-releases/tiny/Dockerfile" -t catears/ffs:tiny
docker build $BUILD_DIR --no-cache -t catears/ffs
