#!/bin/bash
# Create the distribution directory
mkdir -p dist

# Set the addon name based on the current directory
ADDON_NAME=$(basename "$PWD")
ZIP_FILE="dist/${ADDON_NAME}.zip"

# Remove existing zip if it exists
rm -f "$ZIP_FILE"

# Zip the contents of the src directory
# We change directory into src so that __init__.py is at the root of the zip
(cd src && zip -r "../$ZIP_FILE" .)

echo "Package created: $ZIP_FILE"
