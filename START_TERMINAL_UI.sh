#!/bin/bash

# Start Revolutionary UI Terminal Interface

echo "🚀 Starting Revolutionary UI Terminal..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the revolutionary-ui directory"
    exit 1
fi

# Options for running the Terminal UI
echo "Choose how to run the Terminal UI:"
echo ""
echo "1) Via npm script (recommended)"
echo "2) Via binary"
echo "3) Direct TypeScript execution"
echo "4) Standalone executable"
echo ""

read -p "Select option (1-4): " choice

case $choice in
    1)
        echo "Running via npm script..."
        npm run ui
        ;;
    2)
        echo "Running via binary..."
        ./bin/revolutionary-ui
        ;;
    3)
        echo "Running via TypeScript..."
        tsx src/cli/index.ts
        ;;
    4)
        echo "Running standalone executable..."
        ./revolutionary-ui-terminal
        ;;
    *)
        echo "Invalid option. Running default (npm script)..."
        npm run ui
        ;;
esac