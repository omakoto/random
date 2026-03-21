#!/bin/bash

# Define the image name (must match 00-create-ubuntu.sh)
IMAGE_NAME="ubuntu-25-custom"

if [ -z "$1" ]; then
    echo "Usage: $0 <script-file>"
    exit 1
fi

SCRIPT_PATH=$(realpath "$1")
SCRIPT_NAME=$(basename "$SCRIPT_PATH")

if [ ! -f "$SCRIPT_PATH" ]; then
    echo "Error: File $1 not found."
    exit 1
fi

echo "Running $SCRIPT_NAME inside $IMAGE_NAME..."

# --rm: Automatically remove the container when it exits
# -it: Interactive terminal
# --user omakoto: Login as the omakoto user
# -v: Mount the script file as read-only into the home directory
docker run --rm -it \
    --user omakoto \
    -v "$SCRIPT_PATH:/home/omakoto/$SCRIPT_NAME:ro" \
    "$IMAGE_NAME" /bin/bash -c "bash /home/omakoto/$SCRIPT_NAME"
