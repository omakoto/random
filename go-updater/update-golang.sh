#!/bin/bash

# Get currently installed version
if ! INSTALLED_VERSION_FULL=$(go version 2>/dev/null); then
    echo "Go is not installed or not in PATH."
    INSTALLED_VERSION="0.0.0"
else
    INSTALLED_VERSION=$(echo "$INSTALLED_VERSION_FULL" | awk '{print $3}' | sed 's/go//')
fi

# Get latest stable version from Go website
REMOTE_VERSION_FULL=$(curl -s https://go.dev/dl/?mode=json | jq -r '.[] | select(.stable == true) | .version' | head -n 1)
REMOTE_VERSION=$(echo "$REMOTE_VERSION_FULL" | sed 's/go//')

if [[ -z "$REMOTE_VERSION" ]]; then
    echo "Failed to fetch latest Go version."
    exit 1
fi

echo "Installed Go version: $INSTALLED_VERSION"
echo "Latest Go version:    $REMOTE_VERSION"

# Function to compare version strings (v1 > v2)
version_gt() {
    test "$(printf '%s\n' "$@" | sort -V | head -n 1)" != "$1"
}

if version_gt "$REMOTE_VERSION" "$INSTALLED_VERSION"; then
    echo "A newer version of Go is available: $REMOTE_VERSION"
    
    # Detect OS and Arch
    OS=$(uname -s | tr '[:upper:]' '[:lower:]')
    ARCH=$(uname -m)
    case "$ARCH" in
        x86_64)  ARCH="amd64" ;;
        aarch64) ARCH="arm64" ;;
        armv7l)  ARCH="armv6l" ;; # Closest match for generic ARM
        i386|i686) ARCH="386" ;;
    esac

    FILENAME="go${REMOTE_VERSION}.${OS}-${ARCH}.tar.gz"
    DOWNLOAD_URL="https://go.dev/dl/${FILENAME}"
    DEST_PATH="/tmp/${FILENAME}"

    echo "Downloading ${DOWNLOAD_URL} to ${DEST_PATH}..."
    curl -L "$DOWNLOAD_URL" -o "$DEST_PATH"
    
    if [[ $? -eq 0 ]]; then
        echo "Download complete: ${DEST_PATH}"
    else
        echo "Download failed."
        exit 1
    fi
else
    echo "Go is up to date."
fi
