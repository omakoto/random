#!/bin/bash

# Docker Engine installation instructions for Ubuntu:
# https://docs.docker.com/engine/install/ubuntu/

# Exit on any error
set -e

echo "Starting Docker installation for Ubuntu..."

# 1. Remove conflicting packages
echo "Removing old/conflicting Docker packages..."
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do
    sudo apt-get remove -y $pkg || true
done

# 2. Set up Docker's APT repository
echo "Setting up Docker's APT repository..."
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update

# 3. Install Docker packages
echo "Installing Docker Engine, CLI, and plugins..."
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 4. Manage Docker as a non-root user
echo "Adding $USER to the 'docker' group..."
sudo usermod -aG docker $USER

echo "------------------------------------------------------------"
echo "Installation complete!"
echo "CRITICAL: You MUST log out and log back in (or restart your session)"
echo "for the group changes to take effect."
echo "------------------------------------------------------------"
