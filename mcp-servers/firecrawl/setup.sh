#!/bin/bash

echo "🔥 Setting up Firecrawl MCP Server"
echo "================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the server
echo "🏗️  Building server..."
npm run build

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOL
# Firecrawl API Configuration
FIRECRAWL_API_KEY=your_api_key_here

# Optional: Override default settings
# FIRECRAWL_API_URL=https://api.firecrawl.dev/v1
# DEFAULT_PRESET=balanced
# MAX_TOKENS_PER_RESPONSE=100000
EOL
    echo "⚠️  Please update .env with your Firecrawl API key"
fi

# Copy configuration to project root if needed
CONFIG_FILE="../../.firecrawl-mcp-config.json"
if [ ! -f "$CONFIG_FILE" ]; then
    echo "📋 Copying default configuration..."
    cp ../../.firecrawl-mcp-config.json "$CONFIG_FILE" 2>/dev/null || true
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "To use the Firecrawl MCP server:"
echo "1. Update .env with your Firecrawl API key"
echo "2. Add to your MCP client configuration:"
echo ""
echo '  "mcpServers": {'
echo '    "firecrawl": {'
echo '      "command": "node",'
echo '      "args": ["'$(pwd)'/dist/index.js"],'
echo '      "env": {'
echo '        "FIRECRAWL_API_KEY": "${FIRECRAWL_API_KEY}"'
echo '      }'
echo '    }'
echo '  }'
echo ""
echo "3. Or run directly: npm start"
echo ""
echo "Available presets:"
echo "  - lightweight: Fast, minimal content (50k tokens)"
echo "  - balanced: Default, good for most uses (100k tokens)"
echo "  - comprehensive: Deep analysis (150k tokens)"
echo "  - api-safe: Conservative rate limits (30k tokens)"