#!/bin/bash

echo "Testing Revolutionary UI with different terminal types..."
echo ""

# Test with xterm
echo "1. Testing with TERM=xterm"
TERM=xterm npx revolutionary-ui ai-interactive &
PID1=$!
sleep 5
kill $PID1 2>/dev/null

# Test with screen
echo "2. Testing with TERM=screen"
TERM=screen npx revolutionary-ui ai-interactive &
PID2=$!
sleep 5
kill $PID2 2>/dev/null

# Test with vt100
echo "3. Testing with TERM=vt100"
TERM=vt100 npx revolutionary-ui ai-interactive &
PID3=$!
sleep 5
kill $PID3 2>/dev/null

echo "Test complete. Use the terminal type that worked best."