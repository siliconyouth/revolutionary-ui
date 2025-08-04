#!/bin/bash

echo "🔥 Firecrawl API Setup"
echo "===================="
echo ""

# Check if .env.local exists
if [ -f .env.local ]; then
    echo "✅ .env.local already exists"
    
    # Check if Firecrawl API key is already set
    if grep -q "FIRECRAWL_API_KEY=" .env.local; then
        echo "✅ Firecrawl API key is already configured"
    else
        echo "➕ Adding Firecrawl API key to .env.local..."
        echo "" >> .env.local
        echo "# Firecrawl API Configuration" >> .env.local
        echo "FIRECRAWL_API_KEY=fc-dfcaaaa968b743f591bc37942f65b102" >> .env.local
        echo "✅ Firecrawl API key added"
    fi
else
    echo "📝 Creating .env.local with Firecrawl configuration..."
    cp .env.sample .env.local
    
    # Replace the placeholder with actual API key
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' 's/FIRECRAWL_API_KEY=your_api_key_here/FIRECRAWL_API_KEY=fc-dfcaaaa968b743f591bc37942f65b102/' .env.local
    else
        # Linux
        sed -i 's/FIRECRAWL_API_KEY=your_api_key_here/FIRECRAWL_API_KEY=fc-dfcaaaa968b743f591bc37942f65b102/' .env.local
    fi
    
    echo "✅ .env.local created with Firecrawl API key"
fi

echo ""
echo "📋 Current Firecrawl Configuration:"
echo "=================================="
grep "FIRECRAWL" .env.local | grep -v "^#" || echo "No Firecrawl configuration found"

echo ""
echo "🚀 To use Firecrawl in your code:"
echo "================================="
echo "1. Import the client:"
echo "   import { firecrawlAPI } from './src/interactive/tools/FirecrawlAPIClient';"
echo ""
echo "2. Use the API:"
echo "   const result = await firecrawlAPI.scrape('https://example.com');"
echo ""
echo "3. Or with the manager for pagination:"
echo "   import { firecrawlManager } from './src/interactive/tools/FirecrawlManager';"
echo "   const chunks = await firecrawlManager.crawlWithPagination('https://example.com');"
echo ""
echo "✅ Setup complete!"