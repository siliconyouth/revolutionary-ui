#!/bin/bash

# Test script for Revolutionary UI Create App

echo "Testing Revolutionary UI Create App CLI"
echo "======================================"
echo ""
echo "This will create a new project in a temporary directory"
echo ""

# Create a temporary directory
TEMP_DIR=$(mktemp -d)
echo "Creating project in: $TEMP_DIR"

# Change to temp directory
cd "$TEMP_DIR"

# Run the create app CLI
echo ""
echo "Running: npx tsx /Users/vladimir/projects/revolutionary-ui/src/cli/create-app.ts test-app"
echo ""

# Run with a project name to avoid interactive prompt
npx tsx /Users/vladimir/projects/revolutionary-ui/src/cli/create-app.ts test-app

echo ""
echo "If successful, project created at: $TEMP_DIR/test-app"