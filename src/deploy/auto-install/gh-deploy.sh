#!/bin/bash
set -eu

LATEST_RELEASE_JSON=/tmp/catears-ffs-latest-release.json
curl -H "Accept: application/vnd.github+json" \
     -H "X-GitHub-Api-Version: 2022-11-28" \
     https://api.github.com/repos/catears/ffs/releases/latest \
     > $LATEST_RELEASE_JSON

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

RELEASE_NAME=$($PYTHON_CMD - <<EOF
import json

try:
    with open('/tmp/catears-ffs-latest-release.json', 'r') as f:
        data = json.load(f)

    for asset in data.get('assets', []):
        if asset.get('name') == 'ffs.latest.tar.gz':
            print(asset.get('browser_download_url'))

except FileNotFoundError:
    print(f"Error: The file '{filepath}' was not found.")
except json.JSONDecodeError:
    print(f"Error: Could not decode JSON from the file '{filepath}'.")
except Exception as e:
    print(f"An unexpected error occurred: {e}")
EOF
)

echo "Downloading $RELEASE_NAME"

wget -O /tmp/catears-ffs-latest.tar.gz $RELEASE_NAME

gzip -fd /tmp/catears-ffs-latest.tar.gz

docker load -i /tmp/catears-ffs-latest.tar
