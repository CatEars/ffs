#!/bin/bash
set -euo pipefail

VERSION="1.27.3"
SHA256="65efbc80fdc1fa2cd2631cad5b481777a68e8725f34e89f50fc6ac714e379b40"
PLATFORM="linux-amd64"
TAR_NAME="go$VERSION.$PLATFORM.tar.gz"

THIS_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export GO_DL_VERSION="$VERSION"
export GO_DL_PLATFORM="$PLATFORM"
export GO_DL_SHA256="$SHA256"
$THIS_SCRIPT_DIR/download-go.sh
TAR_LOCATION="./data/vendor/$TAR_NAME"
BIN_DIR="$HOME/.local/bin"
GO_INSTALL_DIR="$HOME/go-install"

if [[ -d "$GO_INSTALL_DIR" ]];
then
    echo "Go already installed"
    # Use single quote to not expand
    A='$(which go) $(which gofmt)'
    echo "To remove and enable upgrade:"
    echo
    echo "  rm -rf $A $GO_INSTALL_DIR"
    echo
    exit 0
fi

WORKDIR=$(mktemp -d -t golang-install-$VERSION-XXXXXX)
cleanup() {
    echo "Cleaning up $WORKDIR"
    rm -rf $WORKDIR
}
trap cleanup EXIT

echo "Working in $WORKDIR"
cp $TAR_LOCATION $WORKDIR
pushd $WORKDIR
echo "Extracting $TAR_NAME"
tar -xf $TAR_NAME
mv go $GO_INSTALL_DIR
mkdir -p $BIN_DIR

echo "Linking go to $BIN_DIR/go from $GO_INSTALL_DIR/bin/go"
ln -s -f $GO_INSTALL_DIR/bin/go $BIN_DIR/go
ln -s -f $GO_INSTALL_DIR/bin/gofmt $BIN_DIR/gofmt

$THIS_SCRIPT_DIR/add-go-root-include-to-bashrc.sh

