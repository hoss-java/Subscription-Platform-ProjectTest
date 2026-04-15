#!/bin/bash

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONTAINER_RUN_SCRIPT="$SCRIPT_DIR/container-run"

# Check if container-run script exists
if [ ! -f "$CONTAINER_RUN_SCRIPT" ]; then
    echo "❌ Error: 'container-run' script not found in $SCRIPT_DIR"
    echo "Please ensure 'container-run' is in the same directory as this test script."
    exit 1
fi

source "$CONTAINER_RUN_SCRIPT"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# File type configuration - easily extensible
declare -A FILE_PATTERNS=(
    ["java"]="*Test.java|*Tests.java"
    ["js"]="*.test.js|*.spec.js"
)

declare -A TEST_DIRECTORIES=(
    ["java"]="$SCRIPT_DIR/subscriptionapi/src/test"
    ["js"]="$SCRIPT_DIR/clients/webclientv1/tests"
)

declare -A TEST_RUNNERS=(
    ["java"]="run_maven_test"
    ["js"]="run_jest_test"
)

declare -A TEST_METHODS_EXTRACTORS=(
    ["java"]="extract_java_test_methods"
    ["js"]="extract_js_test_methods"
)

# Runtime variables
declare -a PASSED_TESTS
declare -a FAILED_TESTS
declare -a ALL_TESTS
declare -A TEST_COUNTS
declare -A TEST_FAILURES
declare -A TEST_METHODS

# Configuration variables
VERBOSE_MODE=false
STOP_ON_FAILURE=false
PARALLEL_THREADS=1
FILTER_PATTERN=""
EXCLUDE_PATTERN=""
TEST_TYPE=""
FAILED_ONLY=false
FAILED_TESTS_FILE=".failed_tests"
DETECTED_FILE_TYPE=""
SHOW_TEST_METHODS=false

# Function to display help
show_help() {
    echo -e "${BLUE}Test Runner - Usage Guide${NC}\n"
    
    echo -e "${GREEN}Usage:${NC}"
    echo "  ./run-tests.sh [COMMAND] [OPTIONS]\n"
    
    echo -e "${GREEN}Commands:${NC}"
    echo "  --list                    List all discovered test classes without running them"
    echo "  --count                   Show how many tests were discovered"
    echo -e "  --help, -h                Show this help message\n"
    
    echo -e "${GREEN}Options:${NC}"
    echo "  --filter <pattern>        Run only tests matching a pattern (e.g., --filter \"User\")"
    echo "  --exclude <pattern>       Exclude tests matching a pattern (e.g., --exclude \"Integration\")"
    echo "  --unit-only               Run only unit tests"
    echo "  --integration-only        Run only integration tests"
    echo "  --verbose, -v             Show full output instead of suppressing it"
    echo "  --failed-only             Re-run only tests that failed in the previous run"
    echo "  --stop-on-failure         Stop running tests on first failure"
    echo -e "  --parallel <n>            Run tests in parallel with n threads (default: 1)\n"
    
    echo -e "${GREEN}Examples:${NC}"
    echo "  ./run-tests.sh --list"
    echo "  ./run-tests.sh --filter \"User\" --verbose"
    echo "  ./run-tests.sh --unit-only"
    echo "  ./run-tests.sh --integration-only --parallel 4"
    echo ""
}

# Function to parse command line arguments
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --list)
                LIST_ONLY=true
                SHOW_TEST_METHODS=true
                shift
                ;;
            --count)
                COUNT_ONLY=true
                shift
                ;;
            --filter)
                FILTER_PATTERN="$2"
                SHOW_TEST_METHODS=true
                shift 2
                ;;
            --exclude)
                EXCLUDE_PATTERN="$2"
                shift 2
                ;;
            --unit-only)
                TEST_TYPE="unit"
                shift
                ;;
            --integration-only)
                TEST_TYPE="integration"
                shift
                ;;
            --verbose|-v)
                VERBOSE_MODE=true
                shift
                ;;
            --failed-only)
                FAILED_ONLY=true
                shift
                ;;
            --stop-on-failure)
                STOP_ON_FAILURE=true
                shift
                ;;
            --parallel)
                PARALLEL_THREADS="$2"
                shift 2
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                echo "❌ Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done
}

# Function to detect file type from test file
detect_file_type() {
    local test_file=$1
    
    if [[ "$test_file" == *.java ]]; then
        echo "java"
    elif [[ "$test_file" == *.js ]]; then
        echo "js"
    else
        echo ""
    fi
}

# Function to discover tests
discover_tests() {
    declare -a discovered_tests
    local file_count=0

    # Try each file type
    for file_type in "${!FILE_PATTERNS[@]}"; do
        local test_dir="${TEST_DIRECTORIES[$file_type]}"
        
        if [ ! -d "$test_dir" ]; then
            continue
        fi

        local patterns="${FILE_PATTERNS[$file_type]}"
        local IFS='|'
        
        for pattern in $patterns; do
            while IFS= read -r test_file; do
                local class_name=$(basename "$test_file")
                discovered_tests+=("$class_name:$file_type")
                ((file_count++))
            done < <(find "$test_dir" -type f -name "$pattern" | sort)
        done
    done

    if [ $file_count -eq 0 ]; then
        echo "❌ Error: No test files found in any test directory"
        echo "Expected:"
        for file_type in "${!FILE_PATTERNS[@]}"; do
            echo "  - ${FILE_PATTERNS[$file_type]} in ${TEST_DIRECTORIES[$file_type]}"
        done
        exit 1
    fi

    echo "${discovered_tests[@]}"
}


# Extract test methods from Java test file
extract_java_test_methods() {
    local test_file=$1
    
    # Remove .java extension if present
    test_file="${test_file%.java}"
    
    local test_dir="${TEST_DIRECTORIES[java]}"
    
    # Search for the file recursively in the test directory
    local full_path=$(find "$test_dir" -name "${test_file}.java" -type f | head -1)
    
    if [ -z "$full_path" ] || [ ! -f "$full_path" ]; then
        return
    fi

    # Extract method names: find @Test or @ParameterizedTest, then look ahead for void method
    grep -A 20 "@Test\|@ParameterizedTest" "$full_path" \
    | grep "void" \
    | sed 's/.*void \([a-zA-Z0-9_]*\).*/\1/' \
    | sort -u
}

# Extract test methods from JavaScript test file
extract_js_test_methods() {
    local test_file=$1
    
    # Remove file extensions
    test_file="${test_file%.test.js}"
    test_file="${test_file%.spec.js}"
    test_file="${test_file%.js}"
    
    local test_dir="${TEST_DIRECTORIES[js]}"
    
    # Search for the file recursively in the test directory
    local full_path=$(find "$test_dir" -name "${test_file}.test.js" -o -name "${test_file}.spec.js" | head -1)
    
    if [ -z "$full_path" ] || [ ! -f "$full_path" ]; then
        return
    fi

    # Only match test() or it() that are NOT preceded by // (comments)
    grep -E "^\s*(it|test)\(\s*['\"]" "$full_path" | sed "s/.*['\"\`]\([^'\"]*\)['\"\`].*/\1/" | sort -u
}

# Function to filter tests based on criteria
filter_tests() {
    local -n tests_array=$1
    local -a filtered_tests

    for test_entry in "${tests_array[@]}"; do
        local test="${test_entry%:*}"
        local file_type="${test_entry##*:}"

        # Apply test type filter
        if [ -n "$TEST_TYPE" ]; then
            if [ "$TEST_TYPE" = "unit" ] && [[ "$test" =~ Integration ]]; then
                continue
            elif [ "$TEST_TYPE" = "integration" ] && [[ ! "$test" =~ Integration ]]; then
                continue
            fi
        fi

        # Apply include filter
        if [ -n "$FILTER_PATTERN" ] && [[ ! "$test" =~ $FILTER_PATTERN ]]; then
            continue
        fi

        # Apply exclude filter
        if [ -n "$EXCLUDE_PATTERN" ] && [[ "$test" =~ $EXCLUDE_PATTERN ]]; then
            continue
        fi

        filtered_tests+=("$test_entry")
    done

    echo "${filtered_tests[@]}"
}

# Load previously failed tests
load_failed_tests() {
    if [ -f "$FAILED_TESTS_FILE" ]; then
        mapfile -t failed_tests < "$FAILED_TESTS_FILE"
        echo "${failed_tests[@]}"
    fi
}

# Save failed tests to file
save_failed_tests() {
    > "$FAILED_TESTS_FILE"
    for test in "${FAILED_TESTS[@]}"; do
        echo "$test" >> "$FAILED_TESTS_FILE"
    done
}

parse_maven_output() {
    local test_class=$1
    local output=$2
    local passed=0
    local failed=0
    
    local class_name="${test_class%.java}"

    if [[ $output =~ Tests\ run:\ ([0-9]+),\ Failures:\ ([0-9]+),\ Errors:\ ([0-9]+) ]]; then
        passed=$((${BASH_REMATCH[1]} - ${BASH_REMATCH[2]} - ${BASH_REMATCH[3]}))
        failed=$((${BASH_REMATCH[2]} + ${BASH_REMATCH[3]}))
    fi
    
    # Extract failed test method names
    local failures=$(echo "$output" | grep "Failures:" -A 100 | grep "${class_name}" | grep -oP "\.\K[a-zA-Z0-9_]+(?=:)" | tr '\n' ',' | sed 's/,$//')

    TEST_COUNTS["$test_class"]="$passed/$((passed + failed))"
    if [ -n "$failures" ]; then
        TEST_FAILURES["$test_class"]="$failures"
    fi
    
    echo "$failures"
}


# Parse Jest test output
parse_jest_output() {
    local test_class=$1
    local output=$2
    
    # Extract failed test method names - remove newlines, carriage returns, and ANSI codes
    local failures=$(echo "$output" | grep "●.*›" | sed 's/.*› //' | tr '\n' ',' | sed 's/,$//' | tr -d '\r' | sed 's/\x1b\[[0-9;]*m//g')
    
    if [ -n "$failures" ]; then
        TEST_FAILURES["$test_class"]="$failures"
    fi
    
    # Count total tests and failed tests from the test file itself
    local file_type="js"
    local extractor="${TEST_METHODS_EXTRACTORS[$file_type]}"
    
    # Get all test methods
    local all_methods=()
    while IFS= read -r method; do
        if [ -n "$method" ]; then
            all_methods+=("$method")
        fi
    done < <($extractor "$test_class")
    
    local total=${#all_methods[@]}
    
    # Count failures
    local failed=0
    if [ -n "$failures" ]; then
        failed=$(echo "$failures" | tr ',' '\n' | grep -v '^$' | wc -l)
    fi
    
    local passed=$((total - failed))
    
    TEST_COUNTS["$test_class"]="$passed/$total"
}


# Run Maven test
run_maven_test() {
    local test=$1
    local output
    
    output=$(mvn test -Dspring.profiles.active=test -Dtest=$test -DparallelForks=$PARALLEL_THREADS 2>&1)
    local exit_code=$?
    
    parse_maven_output "$test" "$output"
    
    if [ "$VERBOSE_MODE" = true ]; then
        echo "$output"
    fi
    
    return $exit_code
}

# Run Jest test
run_jest_test() {
    local test=$1
    
    local test_name="${test%.test.js}"
    test_name="${test_name%.spec.js}"
    
    local test_dir="${TEST_DIRECTORIES[js]}"
    
    local output
    
    local test_file=$(find "$test_dir" -name "${test_name}.test.js" -o -name "${test_name}.spec.js" | head -1)
    
    if [ -z "$test_file" ] || [ ! -f "$test_file" ]; then
        echo "Test file not found: $test"
        return 1
    fi
    
    output=$(jest "$test_file" --no-cache 2>&1)  # ← Add --no-cache here
    local exit_code=$?
    
    parse_jest_output "$test" "$output"
    
    if [ "$VERBOSE_MODE" = true ]; then
        echo "$output"
    fi
    
    return $exit_code
}


# Run a single test (dispatches to appropriate runner)
run_test() {
    local test_entry=$1
    local test="${test_entry%:*}"
    local file_type="${test_entry##*:}"
    
    # Get the appropriate test runner function
    local runner_func="${TEST_RUNNERS[$file_type]}"
    
    if [ -z "$runner_func" ]; then
        echo "❌ Unknown file type: $file_type"
        return 1
    fi
    
    # Call the appropriate runner
    $runner_func "$test"
}

# Display test list with methods
display_test_list() {
    local -a tests=($1)
    
    echo ""
    printf "%-50s | %-6s\n" "Test Name" "Type"
    printf "%s\n" "$(printf '=%.0s' {1..62})"

    for test_entry in "${tests[@]}"; do
        local test="${test_entry%:*}"
        local file_type="${test_entry##*:}"
        
        if [[ "$test" =~ Integration ]]; then
            test_type="INT"
        else
            test_type="UNIT"
        fi
        
        printf "%-50s | %-6s\n" "$test" "$test_type"
        
        # Show test methods if we should
        if [ "$SHOW_TEST_METHODS" = true ]; then
            local extractor="${TEST_METHODS_EXTRACTORS[$file_type]}"
            if [ -n "$extractor" ]; then
                while IFS= read -r method; do
                    if [ -n "$method" ]; then
                        printf "  ${CYAN}├─ %s${NC}\n" "$method"
                    fi
                done < <($extractor "$test")
            fi
        fi
    done

    echo ""
    printf "Total: ${#tests[@]} test class(es)\n"
}

# Display test results with dynamic column sizing and test methods
display_results() {
    local -a passed_tests=("${!1}")
    local -a failed_tests=("${!2}")
    local total=$3
    
    # Calculate the longest test name for proper column width
    local max_name_length=10
    for test_entry in "${passed_tests[@]}" "${failed_tests[@]}"; do
        local test="${test_entry%:*}"
        local file_type="${test_entry##*:}"
        local display_name="$test [$file_type]"
        if [ ${#display_name} -gt $max_name_length ]; then
            max_name_length=${#display_name}
        fi
    done
    
    # Add some padding
    ((max_name_length += 2))
    
    # Create header
    printf "%-${max_name_length}s | %-15s | %-10s\n" "Test Name" "Count (P/T)" "Status"
    
    # Create separator line
    local separator_length=$((max_name_length + 15 + 10 + 8))
    printf "%s\n" "$(printf '=%.0s' $(seq 1 $separator_length))"

    # Print passed tests
    for test_entry in "${passed_tests[@]}"; do
        local test="${test_entry%:*}"
        local file_type="${test_entry##*:}"
        count=${TEST_COUNTS[$test]:-"?"}
        printf "%-${max_name_length}s | %-15s | ${GREEN}%-10s${NC}\n" "$test [$file_type]" "$count" "PASSED"
        
        # Show individual test methods if filter was used
        if [ -n "$FILTER_PATTERN" ]; then
            show_test_methods "$test" "$file_type"
        fi
    done

    # Print failed tests
    for test_entry in "${failed_tests[@]}"; do
        local test="${test_entry%:*}"
        local file_type="${test_entry##*:}"
        count=${TEST_COUNTS[$test]:-"?"}
        printf "%-${max_name_length}s | %-15s | ${RED}%-10s${NC}\n" "$test [$file_type]" "$count" "FAILED"
        
        # Show individual test methods if filter was used
        if [ -n "$FILTER_PATTERN" ]; then
            show_test_methods "$test" "$file_type"
        fi
        
        # Show which tests failed within the class
        if [ -n "${TEST_FAILURES[$test]}" ]; then
            echo -e "  ${RED}Failed methods:${NC} ${TEST_FAILURES[$test]}"
        fi
    done

    echo ""
    printf "%s\n" "$(printf '=%.0s' $(seq 1 $separator_length))"
    printf "%-${max_name_length}s | %-15s | %-10s\n" "TOTAL" "$total" ""
    printf "%-${max_name_length}s | %-15s | ${GREEN}%-10s${NC}\n" "PASSED" "${#passed_tests[@]}" ""
    printf "%-${max_name_length}s | %-15s | ${RED}%-10s${NC}\n" "FAILED" "${#failed_tests[@]}" ""
    echo ""
}

# Display individual test methods for a test class
show_test_methods() {
    local test=$1
    local file_type=$2
    
    local extractor="${TEST_METHODS_EXTRACTORS[$file_type]}"
    if [ -z "$extractor" ]; then
        return
    fi
    
    # Get the list of failed methods for this test
    local failed_methods_str="${TEST_FAILURES[$test]}"
    
    declare -a failed_methods
    
    # Parse failed methods into an array (handle different separators)
    if [ -n "$failed_methods_str" ]; then
        if [ "$file_type" = "js" ]; then
            IFS=',' read -ra failed_methods <<< "$failed_methods_str"
        fi
    fi
    
    local method_count=0
    while IFS= read -r method; do
        if [ -n "$method" ]; then
            
            # Check if this method is in the failed methods list
            local is_failed=false
            for failed_method in "${failed_methods[@]}"; do
                local trimmed_failed=$(echo "$failed_method" | xargs)
                if [[ "$method" == "$trimmed_failed" ]]; then
                    is_failed=true
                    break
                fi
            done
            
            # Display with appropriate color and symbol
            if [ "$is_failed" = true ]; then
                printf "  ${RED}✗ %s${NC}\n" "$method"
            else
                printf "  ${GREEN}✓ %s${NC}\n" "$method"
            fi
            ((method_count++))
        fi
    done < <($extractor "$test")
}

# Main script execution
main() {
    parse_arguments "$@"

    # Check if the maven container is running
    if ! container-status maven &>/dev/null; then
        echo "❌ Error: Maven container is not running or does not exist."
        echo "Please start the Maven container before running tests."
        exit 1
    fi

    # Discover all tests
    ALL_TESTS=($(discover_tests))

    # Handle --failed-only mode
    if [ "$FAILED_ONLY" = true ]; then
        failed_tests=($(load_failed_tests))
        if [ ${#failed_tests[@]} -eq 0 ]; then
            echo "ℹ️  No previously failed tests found."
            exit 0
        fi
        ALL_TESTS=("${failed_tests[@]}")
        echo "Running ${#ALL_TESTS[@]} previously failed test(s)..."
    fi

    # Apply filters
    FILTERED_TESTS=($(filter_tests ALL_TESTS))

    # Handle --list command
    if [ "$LIST_ONLY" = true ]; then
        echo "📋 Discovered Test Classes:"
        display_test_list "${FILTERED_TESTS[*]}"
        exit 0
    fi

    # Handle --count command
    if [ "$COUNT_ONLY" = true ]; then
        echo "Found ${#FILTERED_TESTS[@]} test class(es)"
        exit 0
    fi

    # Check if any tests match the filters
    if [ ${#FILTERED_TESTS[@]} -eq 0 ]; then
        echo "❌ No tests match the specified criteria."
        exit 1
    fi

    echo "=========================================="
    echo "Found ${#FILTERED_TESTS[@]} test class(es)"
    echo "Running Tests..."
    echo "=========================================="
    echo ""

    total_tests=${#FILTERED_TESTS[@]}
    current=1

    # Run each test
    for test_entry in "${FILTERED_TESTS[@]}"; do
        local test="${test_entry%:*}"
        local file_type="${test_entry##*:}"
        
        echo -ne "[$current/$total_tests] Running $test [$file_type]... "
        
        # Run test and capture exit code
        if run_test "$test_entry" > /dev/null 2>&1; then
            echo -e "${GREEN}✓ PASSED${NC}"
            PASSED_TESTS+=("$test_entry")
        else
            echo -e "${RED}✗ FAILED${NC}"
            FAILED_TESTS+=("$test_entry")
            
            if [ "$STOP_ON_FAILURE" = true ]; then
                echo ""
                echo "❌ Stopping due to test failure (--stop-on-failure enabled)"
                break
            fi
        fi
        
        ((current++))
    done

    echo ""
    echo "=========================================="
    echo "Test Results Summary"
    echo "=========================================="
    echo ""

    # Display results with dynamic column sizing
    display_results PASSED_TESTS[@] FAILED_TESTS[@] "$total_tests"

    # Save failed tests for --failed-only mode
    if [ ${#FAILED_TESTS[@]} -gt 0 ]; then
        save_failed_tests
        echo "💾 Failed tests saved to '$FAILED_TESTS_FILE' for re-running with --failed-only"
        exit 1
    else
        # Clear failed tests file if all tests passed
        > "$FAILED_TESTS_FILE"
        exit 0
    fi
}

# Run main function with all arguments
main "$@"
