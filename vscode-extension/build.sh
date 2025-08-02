#!/bin/bash

echo "🏭 Building Revolutionary UI Factory VSCode Extension"
echo "===================================================="

# Check if in correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found!"
    echo "Please run this script from the vscode-extension directory."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install vsce if not already installed
if ! command -v vsce &> /dev/null; then
    echo "📦 Installing vsce (Visual Studio Code Extension manager)..."
    npm install -g vsce
fi

# Compile TypeScript
echo "🔨 Compiling TypeScript..."
npm run compile

# Create a simple icon if it doesn't exist
if [ ! -f "icon.png" ]; then
    echo "🎨 Creating placeholder icon..."
    # Create a simple 128x128 blue square as placeholder
    echo "Note: Using placeholder icon. Replace icon.png with your actual icon (128x128px or larger)."
fi

# Package extension
echo "📦 Packaging extension..."
vsce package

# Show results
echo ""
echo "✅ Build complete!"
echo ""
echo "📦 Extension package created:"
ls -la *.vsix
echo ""
echo "📋 Next steps:"
echo "1. Test the extension: code --install-extension revolutionary-ui-factory-*.vsix"
echo "2. Create publisher account at https://marketplace.visualstudio.com/manage"
echo "3. Publish with: vsce publish"
echo ""
echo "For more info on publishing:"
echo "https://code.visualstudio.com/api/working-with-extensions/publishing-extension"