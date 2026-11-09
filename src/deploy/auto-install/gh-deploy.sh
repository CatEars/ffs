#!/bin/bash
set -eu

RELEASE_JSON=/tmp/catears-ffs-releases.json

# 1. Fetch the list of ALL releases instead of just the latest one
curl -H "Accept: application/vnd.github+json" \
     -H "X-GitHub-Api-Version: 2022-11-28" \
     https://api.github.com/repos/catears/ffs/releases \
     > $RELEASE_JSON

if command -v python3 &> /dev/null
then
    PYTHON_CMD="python3"
else
    if command -v python &> /dev/null
    then
        PYTHON_CMD="python"
    else
        echo "Python or Python3 not found on your system."
        exit 1
    fi
fi

# 2. Iterate through releases to find the latest one ending in '-stable'
RELEASE_NAME=$($PYTHON_CMD - <<EOF
import json
import sys

try:
    with open('/tmp/catears-ffs-releases.json', 'r') as f:
        releases = json.load(f)

    target_url = None
    # GitHub returns releases ordered by creation date (newest first)
    for release in releases:
        tag_name = release.get('tag_name', '')
        
        # Check if the tag matches your stable pattern (e.g., ends with '-stable')
        if tag_name.endswith('-stable'):
            for asset in release.get('assets', []):
                if 'tiny' in asset.get('name'):
                    target_url = asset.get('browser_download_url')
                    break
            if target_url:
                break

    if target_url:
        print(target_url)
    else:
        print("Error: No stable release matching '*-stable' with a 'tiny' asset was found.", file=sys.stderr)
        sys.exit(1)

except FileNotFoundError:
    print("Error: The release JSON file was not found.", file=sys.stderr)
    sys.exit(1)
except json.JSONDecodeError:
    print("Error: Could not decode JSON from the release file.", file=sys.stderr)
    sys.exit(1)
except Exception as e:
    print(f"An unexpected error occurred: {e}", file=sys.stderr)
    sys.exit(1)
EOF
)

echo "Downloading $RELEASE_NAME"

wget -O /tmp/catears-ffs-latest.tar.gz "$RELEASE_NAME"

gzip -fd /tmp/catears-ffs-latest.tar.gz

docker load -i /tmp/catears-ffs-latest.tar