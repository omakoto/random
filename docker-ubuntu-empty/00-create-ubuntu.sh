#!/bin/bash

# Define the image name
IMAGE_NAME="ubuntu-25-custom"

echo "Creating Dockerfile..."
cat <<EOF > Dockerfile
FROM ubuntu:plucky

# Set environment variables to non-interactive to avoid prompts during build
ENV DEBIAN_FRONTEND=noninteractive

# Update and install basic packages
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    wget \
    vim \
    sudo \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create user 'omakoto' and add to sudo group
RUN useradd -m -s /bin/bash omakoto && \
    echo "omakoto ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

USER omakoto
WORKDIR /home/omakoto

CMD ["/bin/bash"]
EOF

echo "Building Docker image: $IMAGE_NAME..."
docker build -t "$IMAGE_NAME" .

echo "Cleanup: Removing temporary Dockerfile..."
rm Dockerfile

echo "Done. You can run the image with: ./01-run.sh"
