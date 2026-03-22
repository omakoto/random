#!/bin/bash

cd "$(dirname "$0")"

# Basic test for echo builtin

echo "echo Hello, World!" | ../src/vsh > output.txt
if grep -q "Hello, World!" output.txt; then
    echo "Test passed: echo Hello, World!"
else
    echo "Test failed: echo Hello, World!"
    exit 1
fi

rm output.txt
