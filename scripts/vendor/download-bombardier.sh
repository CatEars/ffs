#!/bin/bash

# --- Configuration ---
REPO_OWNER="codesenberg"
REPO_NAME="bombardier"
THIS_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOWNLOAD_DIR="$THIS_SCRIPT_DIR/bin"

error_exit() {
    echo "Error: $1" >&2
    exit 1
}

get_go_arch() {
    local machine_arch=$(uname -m)
    case "$machine_arch" in
        x86_64)
            echo "amd64"
            ;;
        i386|i486|i586|i686)
            echo "386"
            ;;
        aarch64)
            echo "arm64"
            ;;
        armv7l|armv6l)
            echo "arm"
            ;;
        *)
            error_exit "Unsupported CPU architecture: $machine_arch. Please check Bombardier's releases for compatibility."
            ;;
    esac
}

echo "Detecting your system architecture..."

OS_TYPE=$(uname -s)
if [[ "$OS_TYPE" != "Linux" ]]; then
    error_exit "This script is designed for Linux. Your OS is: $OS_TYPE"
fi

GO_ARCH=$(get_go_arch)
echo "Detected Linux architecture: ${GO_ARCH}"

if ! command -v curl &> /dev/null; then
    error_exit "curl is not installed. Please install it (e.g., sudo apt install curl or sudo yum install curl) and try again."
fi

echo "Fetching latest release information for ${REPO_OWNER}/${REPO_NAME}..."

LATEST_RELEASE_INFO=$(curl "https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest")

if [[ -z "$LATEST_RELEASE_INFO" || "$LATEST_RELEASE_INFO" == *"message\": \"Not Found"* ]]; then
    error_exit "Failed to fetch latest release information. Check repository name or network connection."
fi

RELEASE_TAG=$(echo "$LATEST_RELEASE_INFO" | grep -oP '"tag_name": "\K[^"]+')
if [[ -z "$RELEASE_TAG" ]]; then
    error_exit "Could not find the latest release tag. GitHub API response might have changed or is invalid."
fi

echo "Latest release found: ${RELEASE_TAG}"

# 5. Construct the download URL and filename
BINARY_FILENAME="bombardier-linux-${GO_ARCH}"
DOWNLOAD_URL="https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/download/${RELEASE_TAG}/${BINARY_FILENAME}"
LOCAL_PATH="${DOWNLOAD_DIR}/bombardier"

mkdir -p $DOWNLOAD_DIR

echo "Attempting to download: ${DOWNLOAD_URL}"
echo "Saving to: ${LOCAL_PATH}"

# 6. Download the binary
if ! curl -L -o "$LOCAL_PATH" "$DOWNLOAD_URL"; then
    error_exit "Failed to download the binary from ${DOWNLOAD_URL}. The specific binary for your architecture might not exist for this release."
fi

# 7. Make the binary executable
chmod +x "$LOCAL_PATH"

echo ""
echo "----------------------------------------------------"
echo "Download complete! Bombardier is ready to use."
echo "You can run it from: ${LOCAL_PATH}"
echo "To add it to your PATH, you might move it to /usr/local/bin:"
echo "  sudo mv \"$LOCAL_PATH\" /usr/local/bin/bombardier"
echo "Then you can run it simply as: bombardier"
echo "----------------------------------------------------"
