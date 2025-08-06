#!/bin/bash

# Revolutionary UI Terminal Launcher
# Shows all available Terminal UI options

echo "╔════════════════════════════════════════════════╗"
echo "║     Revolutionary UI Terminal Launcher         ║"
echo "║          Choose Your Interface                 ║"
echo "╚════════════════════════════════════════════════╝"
echo ""
echo "Available Terminal UIs:"
echo ""
echo "1) Elegant UI - Clean & modern (RECOMMENDED)"
echo "2) Ink Beautiful UI - React-based with gradients"
echo "3) Modern Beautiful UI - k9s/lazygit inspired"
echo "4) Ultimate Terminal UI - All features included"
echo "5) Functional Terminal UI - FULLY WORKING"
echo "6) Simple Rich UI - Charts and visualizations"
echo "7) Full Terminal UI - Complete feature set"
echo "8) Advanced Dashboard - Real-time monitoring"
echo "9) Basic Terminal UI - Simple and compatible"
echo "10) Rich Terminal UI - Full widgets (experimental)"
echo "11) Exit"
echo ""
read -p "Select UI (1-11): " choice

case $choice in
    1)
        echo "Launching Elegant UI..."
        export TERM=xterm
        node src/cli/ui/simple-elegant-ui.js
        ;;
    2)
        echo "Launching Ink Beautiful UI..."
        export TERM=xterm
        node src/cli/ui/ink-ui.mjs
        ;;
    3)
        echo "Launching Modern Beautiful UI..."
        export TERM=xterm
        node src/cli/ui/modern-beautiful-ui.js
        ;;
    4)
        echo "Launching Ultimate Terminal UI..."
        export TERM=xterm
        node src/cli/ui/ultimate-terminal-ui.js
        ;;
    5)
        echo "Launching Functional Terminal UI..."
        export TERM=xterm
        node src/cli/ui/functional-terminal-ui.js
        ;;
    6)
        echo "Launching Simple Rich UI..."
        export TERM=xterm
        node src/cli/ui/simple-rich-ui.js
        ;;
    7)
        echo "Launching Full Terminal UI..."
        export TERM=xterm
        export TERMINAL_EMOJIS=false
        node src/cli/ui/full-terminal-ui.js
        ;;
    8)
        echo "Launching Advanced Dashboard..."
        export TERM=xterm-256color
        node src/cli/ui/advanced-dashboard-ui.js
        ;;
    9)
        echo "Launching Basic Terminal UI..."
        export TERM=xterm
        node src/cli/ui/basic-terminal-ui.js
        ;;
    10)
        echo "Launching Rich Terminal UI..."
        export TERM=xterm
        export FORCE_EMOJI=true
        node src/cli/ui/rich-terminal-ui.js
        ;;
    11)
        echo "Goodbye!"
        exit 0
        ;;
    *)
        echo "Invalid choice. Please run again and select 1-11."
        exit 1
        ;;
esac