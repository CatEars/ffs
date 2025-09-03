#!/bin/bash
set -eux

THIS_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$THIS_SCRIPT_DIR/.."
TAG=$(git describe --tags --abbrev=0)

rm -rf $ROOT_DIR/dist/* 
docker save catears/ffs:tiny | gzip > dist/ffs.$TAG.tiny.tar.gz
docker save catears/ffs | gzip > dist/ffs.$TAG.tar.gz
