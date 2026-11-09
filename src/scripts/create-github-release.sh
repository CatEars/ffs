#!/bin/bash
set -eu

echo "Enter GitHub API token: "
read -r FFS_RELEASE_TOKEN

# 1. Get only the tags pointing to the CURRENT commit (HEAD)
TAGS=$(git tag --points-at HEAD)

if [ -z "$TAGS" ]; then
    echo "Error: No git tags found pointing to the current commit (HEAD)." >&2
    exit 1
fi

COMMIT_HASH=$(git rev-parse HEAD)

# Loop through each tag that points to HEAD (e.g., handles v1.2.3 and v1.2.3-stable simultaneously)
for VERSION in $TAGS; do
    echo "=================================================="
    echo "Processing tag: $VERSION (at commit $COMMIT_HASH)"
    echo "=================================================="

    echo "Creating a GitHub release for catears/ffs version $VERSION"
    curl -L \
      -X POST \
      -H "Accept: application/vnd.github+json" \
      -H "Authorization: Bearer $FFS_RELEASE_TOKEN" \
      -H "X-GitHub-Api-Version: 2022-11-28" \
      https://api.github.com/repos/catears/ffs/releases \
      -d "{\"tag_name\":\"$VERSION\",\"target_commitish\":\"$COMMIT_HASH\",\"name\":\"$VERSION\",\"body\":\"Release for catears/ffs $VERSION\"}" > /tmp/release.json

    release_id=$(cat /tmp/release.json | jq .id)
    
    # Safety check if release creation failed (e.g., release already exists)
    if [ "$release_id" = "null" ] || [ -z "$release_id" ]; then
        echo "Error: Failed to create release for $VERSION (it might already exist on GitHub). Skipping asset uploads for this tag."
        continue
    fi

    ARCHIVE_NAME=ffs.$VERSION.tar.gz
    TINY_ARCHIVE_NAME=ffs.$VERSION.tiny.tar.gz

    # Check if files exist locally before uploading
    if [ -f "dist/$ARCHIVE_NAME" ]; then
        echo "Uploading docker $ARCHIVE_NAME archive as release asset to release $release_id"
        curl -L \
          -X POST \
          -H "Accept: application/vnd.github+json" \
          -H "Authorization: Bearer $FFS_RELEASE_TOKEN" \
          -H "X-GitHub-Api-Version: 2022-11-28" \
          -H "Content-Type: application/octet-stream" \
          "https://uploads.github.com/repos/catears/ffs/releases/$release_id/assets?name=$ARCHIVE_NAME" \
          --data-binary "@dist/$ARCHIVE_NAME"
    else
        echo "Warning: dist/$ARCHIVE_NAME not found locally. Skipping."
    fi

    if [ -f "dist/$ARCHIVE_NAME" ]; then
        echo "Uploading docker $ARCHIVE_NAME as ffs.latest.tar.gz as release asset"
        curl -L \
          -X POST \
          -H "Accept: application/vnd.github+json" \
          -H "Authorization: Bearer $FFS_RELEASE_TOKEN" \
          -H "X-GitHub-Api-Version: 2022-11-28" \
          -H "Content-Type: application/octet-stream" \
          "https://uploads.github.com/repos/catears/ffs/releases/$release_id/assets?name=ffs.latest.tar.gz" \
          --data-binary "@dist/$ARCHIVE_NAME"
    fi

    if [ -f "dist/$TINY_ARCHIVE_NAME" ]; then
        echo "Uploading docker $TINY_ARCHIVE_NAME as release asset to release $release_id"
        curl -L \
          -X POST \
          -H "Accept: application/vnd.github+json" \
          -H "Authorization: Bearer $FFS_RELEASE_TOKEN" \
          -H "X-GitHub-Api-Version: 2022-11-28" \
          -H "Content-Type: application/octet-stream" \
          "https://uploads.github.com/repos/catears/ffs/releases/$release_id/assets?name=$TINY_ARCHIVE_NAME" \
          --data-binary "@dist/$TINY_ARCHIVE_NAME"
    fi

    echo "Uploading remaining platform binaries for $VERSION..."
    for FILEPATH in dist/*; do
        [ -e "$FILEPATH" ] || continue
        FILENAME=$(basename "$FILEPATH")

        case "$FILENAME" in
          *.tar.gz)
            echo "Skipping $FILENAME (archive)"
            continue
            ;;
        esac

        echo "Uploading $FILENAME..."
        curl -L \
          -sS \
          -X POST \
          -H "Accept: application/vnd.github+json" \
          -H "Authorization: Bearer $FFS_RELEASE_TOKEN" \
          -H "X-GitHub-Api-Version: 2022-11-28" \
          -H "Content-Type: application/octet-stream" \
          "https://uploads.github.com/repos/catears/ffs/releases/$release_id/assets?name=$FILENAME" \
          --data-binary "@$FILEPATH"
    done

    echo "Finished processing $VERSION"
done

echo "All tags and assets for the current commit processed successfully."