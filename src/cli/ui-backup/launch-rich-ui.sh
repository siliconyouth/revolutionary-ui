#!/bin/bash

# Launch the rich multi-window UI
echo "🚀 Revolutionary UI - Rich Multi-Window Terminal"
echo ""
echo "This UI requires a proper terminal window to run."
echo "Please run this script directly in your terminal:"
echo ""
echo "  ./launch-rich-ui.sh"
echo ""
echo "Features:"
echo "  • Multi-window layout with sidebar"
echo "  • Real-time charts and metrics"
echo "  • Interactive navigation"
echo "  • Beautiful Ink-based UI"
echo ""
echo "If you're seeing this in Claude or another non-TTY environment,"
echo "the UI won't work properly. Open a real terminal and try again!"
echo ""

# Check if we have a TTY
if [ -t 0 ]; then
    echo "✓ TTY detected, launching UI..."
    cd src/beauty-cli && npm run start
else
    echo "✗ No TTY detected. Please run in a proper terminal."
fi