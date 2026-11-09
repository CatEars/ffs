#!/bin/bash
set -euo pipefail

THIS_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BIN_DIR="$THIS_SCRIPT_DIR/bin"
UPX_URL="https://github.com/upx/upx/releases/download/v5.3.0/upx-5.3.0-amd64_linux.tar.xz"

# Create a temporary directory and ensure it gets cleaned up on exit
TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT

echo "Downloading UPX from $UPX_URL..."
curl -sSL "$UPX_URL" -o "$TMP_DIR/upx.tar.xz"

echo "Extracting archive..."
tar -C "$TMP_DIR" -xf "$TMP_DIR/upx.tar.xz"

# Find the 'upx' executable dynamically inside the extracted folder
UPX_BIN_PATH=$(find "$TMP_DIR" -type f -name "upx" -print -quit)

if [ -z "$UPX_BIN_PATH" ]; then
    echo "Error: Could not find the 'upx' binary in the extracted archive." >&2
    exit 1
fi

# Ensure the target bin directory exists
mkdir -p "$BIN_DIR"

echo "Moving UPX binary to $BIN_DIR/upx..."
mv "$UPX_BIN_PATH" "$BIN_DIR/upx"
chmod +x "$BIN_DIR/upx"

echo "Success! UPX installed to: $BIN_DIR/upx"