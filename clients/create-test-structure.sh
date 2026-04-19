#!/bin/bash

# Check if parameter is provided
if [ $# -lt 1 ]; then
    echo "Usage: $0 <source_js_path>"
    echo ""
    echo "Example:"
    echo "  $0 webclientv1/src/js"
    echo ""
    echo "Parameters:"
    echo "  <source_js_path> - Path to source JS directory (e.g., webclientv1/src/js)"
    echo ""
    echo "The script will automatically create tests in: <project_root>/tests/js"
    exit 1
fi

SOURCE_DIR="$1"

# Validate source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo "Error: Source directory '$SOURCE_DIR' not found!"
    exit 1
fi

# Calculate target path: remove /src/js and add /tests/js
PROJECT_ROOT=$(dirname "$(dirname "$SOURCE_DIR")")
TEST_DIR="$PROJECT_ROOT/tests/js"

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE_FILE="$SCRIPT_DIR/.create-test-structure.template"

echo "Source: $SOURCE_DIR"
echo "Target: $TEST_DIR"
echo ""

# Create base test directory if it doesn't exist
if [ ! -d "$TEST_DIR" ]; then
    mkdir -p "$TEST_DIR"
    echo "✓ Created base directory: $TEST_DIR"
fi

# Find all directories in source and create them in test
find "$SOURCE_DIR" -mindepth 1 -type d | while read -r dir; do
    relative_path="${dir#$SOURCE_DIR/}"
    if [ -n "$relative_path" ] && [ ! -d "$TEST_DIR/$relative_path" ]; then
        mkdir -p "$TEST_DIR/$relative_path"
        echo "✓ Created folder: $TEST_DIR/$relative_path"
    fi
done

# Find all .js files and create .test.js files with template
find "$SOURCE_DIR" -type f -name "*.js" -exec bash -c '
    file="$1"
    SOURCE_DIR="$2"
    TEST_DIR="$3"
    PROJECT_ROOT="$4"
    TEMPLATE_FILE="$5"
    
    relative_path="${file#$SOURCE_DIR/}"
    test_file="$TEST_DIR/${relative_path%.js}.test.js"
    source_file_name=$(basename "$file" .js)
    source_relative_path="$SOURCE_DIR/$relative_path"
    
    if [ ! -f "$test_file" ]; then
        # Try to find class name from file
        export_name=$(grep -oP "class\s+\K\w+" "$file" | head -1)

        # Fallback: try to find module.exports
        if [ -z "$export_name" ]; then
            export_name=$(grep -oP "module\.exports\s*=\s*\K\w+" "$file" | head -1)
        fi

        # Last fallback: convert kebab-case filename to camelCase
        if [ -z "$export_name" ]; then
            export_name=$(echo "$source_file_name" | sed -r "s/(^|-)([a-z])/\U\2/g")
        fi
        
        # Check if template file exists
        if [ -f "$TEMPLATE_FILE" ]; then
            # Read template and substitute variables
            export export_name
            export source_relative_path
            export PROJECT_ROOT
            cat "$TEMPLATE_FILE" | envsubst > "$test_file"
        else
            # Create empty test file with comment
            cat > "$test_file" << EOF
// Test file for: $source_relative_path
// TODO: Add your test class here
EOF
        fi
        
        echo "✓ Created test file: $test_file"
    else
        echo "ℹ Test file already exists: $test_file"
    fi
' _ {} "$SOURCE_DIR" "$TEST_DIR" "$PROJECT_ROOT" "$TEMPLATE_FILE" \;

echo ""
echo "✓ Test structure created successfully!"
echo ""
echo "Next steps:"
echo "1. Run tests: npx jest"
