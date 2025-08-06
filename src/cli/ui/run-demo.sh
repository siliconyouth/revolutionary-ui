#!/bin/bash

# Run the terminal UI demo
# Press Ctrl+Q to quit

echo "Starting Revolutionary UI Terminal Demo..."
echo "Controls:"
echo "  - Tab/Shift+Tab: Navigate between fields"
echo "  - Arrow keys: Move cursor in input field"
echo "  - Ctrl+Q: Quit"
echo ""
echo "Press any key to continue..."
read -n 1

# Run the demo
npx tsx src/cli/ui/demo.ts