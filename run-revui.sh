#!/bin/bash
# Run RevUI Terminal with proper settings

# Clear screen
clear

# Set terminal type
export TERM=xterm
export FORCE_COLOR=1
export NODE_NO_WARNINGS=1

# Run the UI
echo "Starting Revolutionary UI Terminal..."
echo "Use arrow keys to navigate, Enter to select, ESC to go back, Q to quit"
echo ""
sleep 1

# Execute with proper terminal settings
exec node src/cli/ui/revui-terminal.js