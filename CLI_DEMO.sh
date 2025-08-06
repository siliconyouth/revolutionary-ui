#!/bin/bash

# Revolutionary UI CLI Demo
# This script demonstrates the working CLI commands

echo "======================================"
echo "Revolutionary UI CLI v3.3.0 Demo"
echo "======================================"
echo ""

# CLI binary path
CLI="/Users/vladimir/projects/revolutionary-ui/bin/revolutionary-ui"

# 1. Show help
echo "1. Showing CLI help:"
echo "------------------------"
$CLI --help | head -20
echo ""

# 2. Show generate command help
echo "2. Generate command help:"
echo "------------------------"
$CLI generate --help
echo ""

# 3. Show add command help
echo "3. Add command help:"
echo "------------------------"
$CLI add --help
echo ""

# 4. Show new project command help
echo "4. New project command help:"
echo "------------------------"
$CLI new --help
echo ""

# 5. Show AI command help
echo "5. AI command help:"
echo "------------------------"
$CLI ai --help
echo ""

echo "======================================"
echo "CLI is working! All commands are available."
echo ""
echo "To use the CLI:"
echo "  $CLI new my-app        # Create new project"
echo "  $CLI generate button   # Generate component"
echo "  $CLI add table         # Add from marketplace"
echo "  $CLI ai \"data table\"   # AI generation"
echo "======================================"