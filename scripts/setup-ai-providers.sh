#!/bin/bash

echo "🤖 Revolutionary UI - AI Provider Setup"
echo "====================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from template..."
    cp .env.sample .env.local
    echo "✅ .env.local created"
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "📋 Current AI Provider Configuration:"
echo "====================================="

# Function to check if API key is set
check_api_key() {
    local key_name=$1
    local provider_name=$2
    local models=$3
    
    if grep -q "^${key_name}=" .env.local && ! grep -q "^${key_name}=your_" .env.local; then
        echo "✅ ${provider_name} - Configured"
        echo "   Models: ${models}"
    else
        echo "❌ ${provider_name} - Not configured"
        echo "   Models: ${models}"
    fi
    echo ""
}

# Check each provider
check_api_key "OPENAI_API_KEY" "OpenAI" "GPT-4 Turbo, GPT-4 Vision, GPT-3.5"
check_api_key "ANTHROPIC_API_KEY" "Anthropic" "Claude 3.5 Sonnet, Claude 3 Opus/Haiku"
check_api_key "GOOGLE_AI_API_KEY" "Google AI" "Gemini 1.5 Pro (1M), Gemini Flash"
check_api_key "MISTRAL_API_KEY" "Mistral" "Mistral Large, Codestral"
check_api_key "GROQ_API_KEY" "Groq" "Llama 3.1 70B (500+ tokens/s)"
check_api_key "DEEPSEEK_API_KEY" "DeepSeek" "DeepSeek Coder V2"
check_api_key "COHERE_API_KEY" "Cohere" "Command R+ (RAG optimized)"
check_api_key "PERPLEXITY_API_KEY" "Perplexity" "Sonar (Web search)"
check_api_key "TOGETHER_API_KEY" "Together" "Open models (Llama, CodeLlama)"
check_api_key "XAI_API_KEY" "xAI" "Grok Beta"

echo "📊 Summary:"
echo "=========="

# Count configured providers
configured=$(grep -E "^(OPENAI|ANTHROPIC|GOOGLE_AI|MISTRAL|GROQ|DEEPSEEK|COHERE|PERPLEXITY|TOGETHER|XAI)_API_KEY=" .env.local | grep -v "your_" | wc -l)
total=10

echo "Configured providers: ${configured}/${total}"
echo ""

# Provide setup instructions
if [ $configured -lt $total ]; then
    echo "🔧 To configure missing providers:"
    echo "================================="
    echo "1. Edit .env.local"
    echo "2. Replace 'your_xxx_api_key_here' with actual API keys"
    echo ""
    echo "📚 Get API keys from:"
    echo "===================="
    echo "• OpenAI:      https://platform.openai.com/api-keys"
    echo "• Anthropic:   https://console.anthropic.com/"
    echo "• Google AI:   https://makersuite.google.com/app/apikey"
    echo "• Mistral:     https://console.mistral.ai/"
    echo "• Groq:        https://console.groq.com/keys"
    echo "• DeepSeek:    https://platform.deepseek.com/"
    echo "• Cohere:      https://dashboard.cohere.com/api-keys"
    echo "• Perplexity:  https://perplexity.ai/api"
    echo "• Together:    https://api.together.xyz/"
    echo "• xAI:         https://x.ai/api"
fi

echo ""
echo "🚀 Quick Start Commands:"
echo "======================="
echo "• Test AI providers:     npm run test:ai"
echo "• Compare models:        revolutionary-ui compare"
echo "• Analyze image:         revolutionary-ui analyze-image <path>"
echo "• Generate code:         revolutionary-ui generate <prompt>"
echo ""

# Check for Ollama
if command -v ollama &> /dev/null; then
    echo "✅ Ollama detected - Local models available"
    ollama list 2>/dev/null | head -5
else
    echo "ℹ️  Ollama not installed - Install for free local models"
    echo "   Visit: https://ollama.ai"
fi

echo ""
echo "✨ Setup script complete!"