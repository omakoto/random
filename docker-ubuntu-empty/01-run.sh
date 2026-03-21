#!/bin/bash

# Define the image name (must match 00-create-ubuntu.sh)
IMAGE_NAME="ubuntu-25-custom"

echo "Running $IMAGE_NAME..."
echo "Changes will not be persisted after exit."

# --rm: Automatically remove the container when it exits
# -it: Interactive terminal
# --user omakoto: Login as the omakoto user

if [ -n "$1" ]; then
    SCRIPT_PATH=$(realpath "$1")
    SCRIPT_NAME=$(basename "$SCRIPT_PATH")
    if [ ! -f "$SCRIPT_PATH" ]; then
        echo "Error: File $1 not found."
        exit 1
    fi
    echo "Running $SCRIPT_NAME and staying in container..."
    docker run --rm -it --user omakoto \
        -v "$SCRIPT_PATH:/home/omakoto/$SCRIPT_NAME:ro" \
        "$IMAGE_NAME" /bin/bash -c "bash /home/omakoto/$SCRIPT_NAME; exec /bin/bash"
else
    docker run --rm -it --user omakoto "$IMAGE_NAME"
fi
