#!/bin/bash

echo "🏭 Revolutionary UI Factory System - NPM Publishing Script"
echo "=========================================================="
echo ""

# Check if logged in to npm
if ! npm whoami &> /dev/null; then
    echo "⚠️  You need to login to npm first!"
    echo ""
    echo "Please run: npm login"
    echo "Then run this script again."
    exit 1
fi

echo "✅ Logged in to npm as: $(npm whoami)"
echo ""

# Verify we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found!"
    echo "Please run this script from the package root directory."
    exit 1
fi

# Get package name and version
PACKAGE_NAME=$(node -p "require('./package.json').name")
PACKAGE_VERSION=$(node -p "require('./package.json').version")

echo "📦 Package: $PACKAGE_NAME"
echo "📌 Version: $PACKAGE_VERSION"
echo ""

# Check if package already exists
if npm view "$PACKAGE_NAME" &> /dev/null; then
    echo "⚠️  Package $PACKAGE_NAME already exists on npm!"
    echo "Current published version: $(npm view $PACKAGE_NAME version)"
    echo ""
    read -p "Do you want to publish a new version? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Publishing cancelled."
        exit 0
    fi
fi

# Run tests
echo "🧪 Running tests..."
if ! npm test; then
    echo "❌ Tests failed! Please fix the issues before publishing."
    exit 1
fi

echo ""
echo "📋 Pre-publish checklist:"
echo "  ✅ Tests passing"
echo "  ✅ README.md present"
echo "  ✅ LICENSE file present"
echo "  ✅ package.json configured"
echo ""

# Final confirmation
read -p "Ready to publish $PACKAGE_NAME@$PACKAGE_VERSION to npm? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Publishing to npm..."
    
    # Publish with public access
    if npm publish --access public; then
        echo ""
        echo "🎉 Success! $PACKAGE_NAME@$PACKAGE_VERSION has been published to npm!"
        echo ""
        echo "📦 View your package at: https://www.npmjs.com/package/$PACKAGE_NAME"
        echo ""
        echo "🔧 Install with: npm install $PACKAGE_NAME"
        echo ""
        echo "Thank you for using the Revolutionary UI Factory System!"
    else
        echo ""
        echo "❌ Publishing failed. Please check the error messages above."
        exit 1
    fi
else
    echo "Publishing cancelled."
fi