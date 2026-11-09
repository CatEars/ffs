#!/bin/bash
set -eux

THIS_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$THIS_SCRIPT_DIR/../.."

TAGS=$(git tag --points-at HEAD)

if [ -z "$TAGS" ]; then
    echo "Error: No git tags found pointing to the current commit (HEAD)." >&2
    exit 1
fi

rm -f "$ROOT_DIR"/dist/*.tar.gz

echo "Generating base archives..."
docker save catears/ffs:tiny | gzip > "$ROOT_DIR/dist/ffs.latest.tiny.tar.gz"
docker save catears/ffs | gzip > "$ROOT_DIR/dist/ffs.latest.tar.gz"

for TAG in $TAGS; do
    echo "Copying archives for tag: $TAG"
    cp "$ROOT_DIR/dist/ffs.latest.tiny.tar.gz" "$ROOT_DIR/dist/ffs.$TAG.tiny.tar.gz"
    cp "$ROOT_DIR/dist/ffs.latest.tar.gz" "$ROOT_DIR/dist/ffs.$TAG.tar.gz"
done

rm -f "$ROOT_DIR/dist/ffs.latest.tiny.tar.gz" "$ROOT_DIR/dist/ffs.latest.tar.gz"

echo "Successfully created archives for all tags on HEAD and cleaned up baseline."
