#!/bin/bash
# Create the distribution directory
mkdir -p dist

# Set the addon name based on the current directory
ADDON_NAME=$(basename "$PWD")
ZIP_FILE="dist/${ADDON_NAME}.zip"

# Remove existing zip if it exists
rm -f "$ZIP_FILE"

# Zip the contents of the src directory into a folder named after the addon
# Blender expects the __init__.py to be inside a subdirectory in the zip
rm -rf "dist/${ADDON_NAME}"
mkdir -p "dist/${ADDON_NAME}"
cp -r src/* "dist/${ADDON_NAME}/"
(cd dist && zip -r "../$ZIP_FILE" "${ADDON_NAME}")
rm -rf "dist/${ADDON_NAME}"

echo "Package created: $ZIP_FILE"
