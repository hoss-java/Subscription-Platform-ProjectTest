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

# Source the container-run script
source "$CONTAINER_RUN_SCRIPT"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Arrays to store results
declare -a PASSED_TESTS
declare -a FAILED_TESTS
declare -a ALL_TESTS
declare -A TEST_COUNTS
declare -A TEST_FAILURES

# Configuration variables
TEST_DIR="subscriptionapi/src/test"
VERBOSE_MODE=false
STOP_ON_FAILURE=false
PARALLEL_THREADS=1
FILTER_PATTERN=""
EXCLUDE_PATTERN=""
TEST_TYPE=""
FAILED_ONLY=false
FAILED_TESTS_FILE=".failed_tests"
TEMP_TEST_OUTPUT=".test_output"

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
    echo "  --unit-only               Run only unit tests (*UnitTest.java)"
    echo "  --integration-only        Run only integration tests (*IntegrationTest.java)"
    echo "  --verbose, -v             Show full Maven output instead of suppressing it"
    echo "  --failed-only             Re-run only tests that failed in the previous run"
    echo "  --stop-on-failure         Stop running tests on first failure"
    echo -e "  --parallel <n>            Run tests in parallel with n threads (default: 1)\n"
    
    echo -e "${GREEN}Examples:${NC}"
    echo "  ./run-tests.sh --list"
    echo "  ./run-tests.sh --filter \"User\" --verbose"
    echo "  ./run-tests.sh --unit-only"
    echo "  ./run-tests.sh --integration-only --parallel 4"
    echo "  ./run-tests.sh --exclude \"Integration\" --stop-on-failure"
    echo "  ./run-tests.sh --failed-only"
    echo ""
}

# Function to parse command line arguments
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --list)
                LIST_ONLY=true
                shift
                ;;
            --count)
                COUNT_ONLY=true
                shift
                ;;
            --filter)
                FILTER_PATTERN="$2"
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

# Function to discover test classes
discover_tests() {
    if [ ! -d "$TEST_DIR" ]; then
        echo "❌ Error: Test directory '$TEST_DIR' not found."
        echo "Please ensure you are running this script from the project root."
        exit 1
    fi

    declare -a discovered_tests
    while IFS= read -r test_file; do
        class_name=$(basename "$test_file" .java)
        discovered_tests+=("$class_name")
    done < <(find "$TEST_DIR" -type f \( -name "*Test.java" -o -name "*Tests.java" \) | sort)

    if [ ${#discovered_tests[@]} -eq 0 ]; then
        echo "❌ Error: No test classes found in '$TEST_DIR'"
        echo "Expected test files matching pattern: *Test.java or *Tests.java"
        exit 1
    fi

    echo "${discovered_tests[@]}"
}

# Function to filter tests based on criteria
filter_tests() {
    local -n tests_array=$1
    local -a filtered_tests

    for test in "${tests_array[@]}"; do
        # Apply test type filter
        if [ -n "$TEST_TYPE" ]; then
            if [ "$TEST_TYPE" = "unit" ] && [[ ! "$test" =~ IntegrationTest$ ]]; then
                :  # Keep unit tests (those NOT ending with IntegrationTest)
            elif [ "$TEST_TYPE" = "integration" ] && [[ "$test" =~ IntegrationTest$ ]]; then
                :  # Keep integration tests
            else
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

        filtered_tests+=("$test")
    done

    echo "${filtered_tests[@]}"
}

# Function to load previously failed tests
load_failed_tests() {
    if [ -f "$FAILED_TESTS_FILE" ]; then
        mapfile -t failed_tests < "$FAILED_TESTS_FILE"
        echo "${failed_tests[@]}"
    fi
}

# Function to save failed tests to file
save_failed_tests() {
    > "$FAILED_TESTS_FILE"  # Clear the file
    for test in "${FAILED_TESTS[@]}"; do
        echo "$test" >> "$FAILED_TESTS_FILE"
    done
}

# Function to parse Maven test output and extract test details
parse_test_output() {
    local test_class=$1
    local output=$2
    local passed=0
    local failed=0
    local failures=""

    # Extract test counts from Maven output
    # Pattern: "Tests run: X, Failures: Y, Errors: Z"
    if [[ $output =~ Tests\ run:\ ([0-9]+),\ Failures:\ ([0-9]+),\ Errors:\ ([0-9]+) ]]; then
        passed=$((${BASH_REMATCH[1]} - ${BASH_REMATCH[2]} - ${BASH_REMATCH[3]}))
        failed=$((${BASH_REMATCH[2]} + ${BASH_REMATCH[3]}))
    fi

    # Extract failed test names
    # Pattern: "testMethodName(ClassName) Time elapsed: X s <<< FAILURE!"
    while IFS= read -r line; do
        if [[ $line =~ ^[[:space:]]*-[[:space:]]([a-zA-Z0-9_]+)\( ]]; then
            failures="${failures}${BASH_REMATCH[1]}, "
        fi
    done < <(echo "$output" | grep -E "^\s*-\s+[a-zA-Z0-9_]+\(")

    # Remove trailing comma and space
    failures="${failures%, }"

    TEST_COUNTS["$test_class"]="$passed/$((passed + failed))"
    if [ -n "$failures" ]; then
        TEST_FAILURES["$test_class"]="$failures"
    fi
}

# Function to run a single test
run_test() {
    local test=$1
    local output

    output=$(mvn test -Dspring.profiles.active=test -Dtest=$test -DparallelForks=$PARALLEL_THREADS 2>&1)
    local exit_code=$?

    # Parse the output for test details
    parse_test_output "$test" "$output"

    # Save output if verbose mode is on
    if [ "$VERBOSE_MODE" = true ]; then
        echo "$output"
    fi

    return $exit_code
}

# Function to display test list
display_test_list() {
    local -a tests=($1)
    
    echo ""
    printf "%-50s | %-5s\n" "Test Name" "Type"
    printf "%s\n" "$(printf '=%.0s' {1..60})"

    for test in "${tests[@]}"; do
        if [[ "$test" =~ IntegrationTest$ ]]; then
            test_type="INT"
        else
            test_type="UNIT"
        fi
        printf "%-50s | %-5s\n" "$test" "$test_type"
    done

    echo ""
    printf "Total: ${#tests[@]} test(s)\n"
}

# Main script execution
main() {
    # Parse command line arguments
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
    for test in "${FILTERED_TESTS[@]}"; do
        echo -ne "[$current/$total_tests] Running $test... "
        
        # Run test and capture exit code
        if run_test "$test" > /dev/null 2>&1; then
            echo -e "${GREEN}✓ PASSED${NC}"
            PASSED_TESTS+=("$test")
        else
            echo -e "${RED}✗ FAILED${NC}"
            FAILED_TESTS+=("$test")
            
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

    # Create table with test counts
    printf "%-40s | %-15s | %-10s\n" "Test Name" "Count (P/T)" "Status"
    printf "%s\n" "$(printf '=%.0s' {1..70})"

    # Print passed tests
    for test in "${PASSED_TESTS[@]}"; do
        count=${TEST_COUNTS[$test]:-"?"}
        printf "%-40s | %-15s | ${GREEN}%-8s${NC}\n" "$test" "$count" "PASSED"
    done

    # Print failed tests
    for test in "${FAILED_TESTS[@]}"; do
        count=${TEST_COUNTS[$test]:-"?"}
        printf "%-40s | %-15s | ${RED}%-8s${NC}\n" "$test" "$count" "FAILED"
        
        # Show which tests failed within the class
        if [ -n "${TEST_FAILURES[$test]}" ]; then
            echo -e "  ${RED}Failed methods:${NC} ${TEST_FAILURES[$test]}"
        fi
    done

    echo ""
    printf "%s\n" "$(printf '=%.0s' {1..70})"
    printf "%-40s | %-15s | %-10s\n" "TOTAL" "$total_tests" ""
    printf "%-40s | %-15s | ${GREEN}%-10s${NC}\n" "PASSED" "${#PASSED_TESTS[@]}" ""
    printf "%-40s | %-15s | ${RED}%-10s${NC}\n" "FAILED" "${#FAILED_TESTS[@]}" ""
    echo ""

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
