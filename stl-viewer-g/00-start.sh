#!/bin/bash
# Start the npm dev server with host exposure
set -e

run() {
    echo "Running: $*"
    "$@"
}

run npm run build
run npm run dev -- --host
