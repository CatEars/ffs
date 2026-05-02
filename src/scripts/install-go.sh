#!/bin/bash
set -euo pipefail

THIS_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VERSION="1.26.2"
GO_DL_URL="https://go.dev/dl/go$VERSION.linux-amd64.tar.gz"
TAR_NAME="go$VERSION.linux-amd64.tar.gz"
BIN_DIR="$HOME/.local/bin"
GO_INSTALL_DIR="$HOME/go"

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
pushd $WORKDIR
wget "$GO_DL_URL"
echo "Extracting $TAR_NAME"
tar -xf $TAR_NAME
mv go $(dirname $GO_INSTALL_DIR)
mkdir -p $BIN_DIR

echo "Linking go to $BIN_DIR/go from $GO_INSTALL_DIR/bin/go"
ln -s $GO_INSTALL_DIR/bin/go $BIN_DIR/go
ln -s $GO_INSTALL_DIR/bin/gofmt $BIN_DIR/gofmt

$THIS_SCRIPT_DIR/add-go-root-include-to-bashrc.sh

