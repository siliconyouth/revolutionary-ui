#!/bin/bash

# Setup Parallel Session Monitoring for Revolutionary UI
# This script configures the monitoring system for optimal Claude Code integration

set -e

echo "🔍 Setting up Parallel Session Monitoring for Revolutionary UI v3.0.0"
echo "========================================================================"

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed"
    echo "Please install Node.js 14+ and try again"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 14 ]; then
    echo "❌ Node.js version $NODE_VERSION is too old"
    echo "Please upgrade to Node.js 14+ and try again"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if we're in the correct directory
if [ ! -f "CLAUDE.md" ] || [ ! -f "CLAUDE_CONTEXT.md" ]; then
    echo "❌ This doesn't appear to be the Revolutionary UI project root"
    echo "Please run this script from the project root directory"
    exit 1
fi

echo "✅ Project root directory confirmed"

# Make monitoring scripts executable
if [ -f ".parallel-session-monitor.js" ]; then
    chmod +x .parallel-session-monitor.js
    echo "✅ Basic monitor permissions set"
fi

if [ -f ".enhanced-session-monitor.js" ]; then
    chmod +x .enhanced-session-monitor.js
    echo "✅ Enhanced monitor permissions set"
else
    echo "❌ Enhanced monitor not found"
    echo "Please ensure .enhanced-session-monitor.js exists"
    exit 1
fi

# Test the enhanced monitor
echo ""
echo "🧪 Testing enhanced monitor..."
if node .enhanced-session-monitor.js health > /dev/null 2>&1; then
    echo "✅ Enhanced monitor is working"
else
    echo "❌ Enhanced monitor test failed"
    echo "Running diagnostic..."
    node .enhanced-session-monitor.js health
    exit 1
fi

# Create monitoring aliases
SHELL_RC=""
if [ -f "$HOME/.bashrc" ]; then
    SHELL_RC="$HOME/.bashrc"
elif [ -f "$HOME/.zshrc" ]; then
    SHELL_RC="$HOME/.zshrc"
fi

if [ -n "$SHELL_RC" ]; then
    echo ""
    echo "🔧 Setting up shell aliases..."
    
    # Check if aliases already exist
    if ! grep -q "rui-monitor" "$SHELL_RC" 2>/dev/null; then
        echo "" >> "$SHELL_RC"
        echo "# Revolutionary UI Monitoring Aliases" >> "$SHELL_RC"
        echo "alias rui-monitor='node $(pwd)/.enhanced-session-monitor.js'" >> "$SHELL_RC"
        echo "alias rui-health='node $(pwd)/.enhanced-session-monitor.js health'" >> "$SHELL_RC"
        echo "alias rui-check='node $(pwd)/.enhanced-session-monitor.js check'" >> "$SHELL_RC"
        echo "alias rui-report='node $(pwd)/.enhanced-session-monitor.js report'" >> "$SHELL_RC"
        echo "✅ Shell aliases added to $SHELL_RC"
        echo "   Run 'source $SHELL_RC' or restart your terminal to use aliases"
    else
        echo "ℹ️  Shell aliases already exist in $SHELL_RC"
    fi
fi

# Create monitoring configuration
cat > .monitoring-config.json << EOF
{
  "project": "Revolutionary UI v3.0.0",
  "version": "1.0.0",
  "created": "$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")",
  "monitoring": {
    "checkInterval": 30000,
    "logLevel": "info",
    "enableWebhook": false,
    "webhookUrl": null,
    "criticalFiles": [
      "CLAUDE.md",
      "CLAUDE_CONTEXT.md",
      "README.md",
      "CHANGELOG.md",
      "package.json",
      "marketplace-nextjs/package.json",
      ".env.local",
      ".env.sample",
      "prisma/schema.prisma",
      "marketplace-nextjs/prisma/schema.prisma",
      "tsconfig.json"
    ],
    "watchedDirectories": [
      "src/ai/",
      "datasets/",
      "prisma/",
      "marketplace-nextjs/src/app/api/",
      "docs/",
      "scripts/"
    ]
  },
  "recommendations": {
    "claudeCode": {
      "refreshContextOn": ["CLAUDE.md", "CLAUDE_CONTEXT.md"],
      "syncDatabaseOn": ["prisma/schema.prisma"],
      "checkDependenciesOn": ["package.json"],
      "reviewEnvironmentOn": [".env.local", ".env.sample"]
    }
  }
}
EOF

echo "✅ Monitoring configuration created (.monitoring-config.json)"

# Create startup script
cat > scripts/start-monitoring.sh << 'EOF'
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
EOF

chmod +x scripts/start-monitoring.sh
echo "✅ Startup script created (scripts/start-monitoring.sh)"

# Create VS Code integration (if .vscode exists)
if [ -d ".vscode" ]; then
    echo ""
    echo "🔧 Setting up VS Code integration..."
    
    mkdir -p .vscode
    
    # Create VS Code task
    cat > .vscode/monitoring-tasks.json << 'EOF'
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "RUI: Start Monitoring",
            "type": "shell",
            "command": "node",
            "args": [".enhanced-session-monitor.js", "start"],
            "group": "build",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "new"
            },
            "runOptions": {
                "runOn": "folderOpen"
            },
            "problemMatcher": []
        },
        {
            "label": "RUI: Health Check",
            "type": "shell",
            "command": "node",
            "args": [".enhanced-session-monitor.js", "health"],
            "group": "test",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": true,
                "panel": "new"
            }
        },
        {
            "label": "RUI: Check Changes",
            "type": "shell",
            "command": "node",
            "args": [".enhanced-session-monitor.js", "check"],
            "group": "test",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": true,
                "panel": "new"
            }
        }
    ]
}
EOF
    echo "✅ VS Code tasks configured (.vscode/monitoring-tasks.json)"
fi

# Run initial health check and report
echo ""
echo "🏥 Initial System Health Check:"
echo "==============================="
node .enhanced-session-monitor.js health

echo ""
echo "📊 System Report:"
echo "================"
node .enhanced-session-monitor.js report

echo ""
echo "✅ Monitoring Setup Complete!"
echo "==============================="
echo ""
echo "📋 Available Commands:"
echo "  node .enhanced-session-monitor.js start    # Start monitoring"
echo "  node .enhanced-session-monitor.js health   # Check system health"
echo "  node .enhanced-session-monitor.js check    # Check for changes"
echo "  node .enhanced-session-monitor.js report   # Generate report"
echo ""
echo "🚀 Quick Start:"
echo "  bash scripts/start-monitoring.sh           # Start with health check"
echo ""
if [ -n "$SHELL_RC" ]; then
echo "🔧 Shell Aliases (after sourcing $SHELL_RC):"
echo "  rui-monitor start    # Start monitoring"
echo "  rui-health          # Check health"
echo "  rui-check           # Check changes"
echo "  rui-report          # Generate report"
echo ""
fi
echo "📖 Documentation:"
echo "  See PARALLEL_SESSION_MONITORING.md for complete guide"
echo ""
echo "💡 Recommended for Claude Code:"
echo "  1. Run 'rui-health' at start of each session"
echo "  2. Keep monitoring running in background"
echo "  3. Refresh context when critical changes detected"
echo ""
echo "🎉 Ready for parallel session monitoring!"