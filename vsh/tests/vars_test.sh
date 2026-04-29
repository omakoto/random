#!/bin/bash

cd "$(dirname "$0")"
VSH=../src/vsh

# Function to run a test case
# Usage: run_test "description" "input_commands" "expected_output"
run_test() {
    local desc=$1
    local input=$2
    local expected=$3
    
    echo -n "Testing $desc... "
    actual=$(echo -e "$input" | $VSH | grep -v "vsh> " | tr -d '\r')
    
    if [ "$actual" == "$expected" ]; then
        echo "PASSED"
    else
        echo "FAILED"
        echo "  Expected: '$expected'"
        echo "  Actual:   '$actual'"
        exit 1
    fi
}

# 1. Basic assignment and expansion
run_test "Basic assignment" "A=123\necho \$A" "123"

# 2. Expansion in double quotes
run_test "Double quotes expansion" "FOO=bar\necho \"Value is \$FOO\"" "Value is bar"

# 3. Expansion in single quotes (should NOT expand)
run_test "Single quotes expansion" "FOO=bar\necho '\$FOO'" "\$FOO"

# 4. Concatenation
run_test "Concatenation" "A=foo\nB=bar\necho \$A\$B" "foobar"

# 5. Braced expansion
run_test "Braced expansion" "NAME=world\necho \${NAME}" "world"

# 6. Multiple assignments on one line
run_test "Multiple assignments" "X=1 Y=2\necho \$X \$Y" "1 2"

# 7. Overwriting variables
run_test "Overwriting" "VAR=old\nVAR=new\necho \$VAR" "new"

# 8. Undefined variables (should be empty)
run_test "Undefined variable" "echo \$UNDEFINED_VAR" ""

# 9. Mixed quotes and expansion
run_test "Mixed quotes" "A=1\necho \"\$A\"'\$A'\"\$A\"" "1\$A1"

echo "All variable tests passed!"
