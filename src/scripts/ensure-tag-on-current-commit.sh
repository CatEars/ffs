#!/usr/bin/env bash
set -eo pipefail

if [ -n "$(git status --porcelain)" ]; then
    echo "Error: Working directory is dirty. Please commit or stash your changes." >&2
    exit 1
fi

if ! git describe --exact-match --tags HEAD >/dev/null 2>&1; then
    echo "Error: The current commit does not have a Git tag." >&2
    exit 1
fi

echo "Success: Working directory is clean and the current commit is tagged."
