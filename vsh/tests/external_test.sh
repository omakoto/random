#!/bin/bash

cd "$(dirname "$0")"
VSH=../src/vsh

# Function to run a test case
# Usage: run_test "description" "input_commands" "expected_output_substring"
run_test() {
    local desc=$1
    local input=$2
    local expected=$3
    
    echo -n "Testing $desc... "
    actual=$(echo -e "$input" | $VSH 2>&1 | grep -v "vsh> " | tr -d '\r')
    
    if echo "$actual" | grep -q "$expected"; then
        echo "PASSED"
    else
        echo "FAILED"
        echo "  Expected to contain: '$expected'"
        echo "  Actual:   '$actual'"
        exit 1
    fi
}

# 1. Simple external command
run_test "Simple external (whoami)" "whoami" "$(whoami)"

# 2. External command with arguments
run_test "External with args (expr)" "expr 1 + 2" "3"

# 3. Path expansion (implicitly via os/exec)
run_test "External in PATH (ls)" "ls -d ." "."

# 4. Command not found
run_test "Command not found" "nonexistent_command_12345" "failed to execute nonexistent_command_12345"

echo "All external command tests passed!"
