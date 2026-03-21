#!/bin/bash

# Define the image name (must match 00-create-ubuntu.sh)
IMAGE_NAME="ubuntu-25-custom"

echo "Running $IMAGE_NAME..."
echo "Changes will not be persisted after exit."

# --rm: Automatically remove the container when it exits
# -it: Interactive terminal
# --user omakoto: Login as the omakoto user
docker run --rm -it --user omakoto "$IMAGE_NAME"
