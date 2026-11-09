#!/bin/bash

THIS_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$THIS_SCRIPT_DIR/../.."

TAGS=$(git tag --points-at HEAD)

if [ -z "$TAGS" ]; then
    echo "Error: No git tags found pointing to the current commit (HEAD)." >&2
    exit 1
fi

for TAG in $TAGS; do
    echo "Copying archives for tag: $TAG"
    cp "$ROOT_DIR/dist/ffs.latest.tiny.tar.gz" "$ROOT_DIR/dist/ffs.$TAG.tiny.tar.gz"
    cp "$ROOT_DIR/dist/ffs.latest.tar.gz" "$ROOT_DIR/dist/ffs.$TAG.tar.gz"
done

rm -f "$ROOT_DIR/dist/ffs.latest.tiny.tar.gz" "$ROOT_DIR/dist/ffs.latest.tar.gz"
