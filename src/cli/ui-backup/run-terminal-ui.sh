#!/bin/bash

# Run Revolutionary UI Terminal with proper environment settings

echo "🚀 Starting Revolutionary UI Terminal..."

# Set terminal to basic mode to avoid compatibility issues
export TERM=xterm
export NODE_NO_WARNINGS=1
export FORCE_COLOR=0

# Clear screen
clear

# Check if node is available
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    exit 1
fi

# Find the best terminal UI to run
if [ -f "src/cli/ui/full-terminal-ui.js" ]; then
    echo "Running full-featured terminal UI..."
    node src/cli/ui/full-terminal-ui.js
elif [ -f "src/cli/ui/basic-terminal-ui.js" ]; then
    echo "Running basic terminal UI..."
    node src/cli/ui/basic-terminal-ui.js
elif [ -f "src/cli/ui/simple-terminal-ui.js" ]; then
    echo "Running simple terminal UI..."
    node src/cli/ui/simple-terminal-ui.js
elif [ -f "terminal-ui-app.js" ]; then
    echo "Running terminal UI app..."
    node terminal-ui-app.js
else
    echo "❌ Error: No terminal UI found"
    echo ""
    echo "Available options:"
    echo "1. Run: npm run ui"
    echo "2. Run: ./bin/revolutionary-ui"
    echo "3. Install globally: npm link"
    exit 1
fi