#!/bin/bash

VERSION=$(git describe --tags --abbrev=0)

echo "Creating a Github release for catears/ffs version $VERSION"
curl -L \
  -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $FFS_RELEASE_TOKEN" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/repos/catears/ffs/releases \
  -d "{\"tag_name\":\"$VERSION\",\"target_commitish\":\"$(git rev-parse HEAD)\",\"name\":\"$VERSION\",\"body\":\"Release for catears/ffs $VERSION\"}" > /tmp/release.json

release_id=$(cat /tmp/release.json | jq .id)
ARCHIVE_NAME=ffs.$VERSION.tar.gz

echo "Uploading docker $ARCHIVE_NAME archive as release asset to release $release_id"
curl -L \
  -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $FFS_RELEASE_TOKEN" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  -H "Content-Type: application/octet-stream" \
  "https://uploads.github.com/repos/catears/ffs/releases/$release_id/assets?name=$ARCHIVE_NAME" \
  --data-binary "@dist/$ARCHIVE_NAME"

echo "Uploading docker $ARCHIVE_NAME as ffs.latest.tar.gz as release asset"
curl -L \
  -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $FFS_RELEASE_TOKEN" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  -H "Content-Type: application/octet-stream" \
  "https://uploads.github.com/repos/catears/ffs/releases/$release_id/assets?name=ffs.latest.tar.gz" \
  --data-binary "@dist/$ARCHIVE_NAME"

