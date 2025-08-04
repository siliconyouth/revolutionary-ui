#!/bin/bash
# Start Revolutionary UI monitoring

PROJECT_ROOT="$(dirname "$0")/.."
cd "$PROJECT_ROOT"

echo "🚀 Starting Revolutionary UI Enhanced Monitoring..."
echo "Project: $(pwd)"
echo "Time: $(date)"
echo ""

# Run health check first
echo "🏥 Health Check:"
node .enhanced-session-monitor.js health
echo ""

# Start monitoring
echo "Starting monitoring (Ctrl+C to stop)..."
node .enhanced-session-monitor.js start
