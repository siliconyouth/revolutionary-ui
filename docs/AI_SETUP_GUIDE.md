# AI Provider Setup Guide

## Quick Start

1. **Copy environment template**
   ```bash
   cp .env.sample .env.local
   ```

2. **Run setup script**
   ```bash
   ./scripts/setup-ai-providers.sh
   ```

3. **Add your API keys to `.env.local`**

## Getting API Keys

### 🔵 OpenAI
1. Visit: https://platform.openai.com/api-keys
2. Create new secret key
3. Add to `.env.local`: `OPENAI_API_KEY=sk-...`
4. **Models available**: GPT-4 Turbo, GPT-4 Vision, GPT-3.5 Turbo

### 🟣 Anthropic (Claude)
1. Visit: https://console.anthropic.com/
2. Create API key in settings
3. Add to `.env.local`: `ANTHROPIC_API_KEY=sk-ant-...`
4. **Models available**: Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku

### 🔴 Google AI (Gemini)
1. Visit: https://makersuite.google.com/app/apikey
2. Create API key
3. Add to `.env.local`: `GOOGLE_AI_API_KEY=...`
4. **Models available**: Gemini 1.5 Pro (1M context!), Gemini 1.5 Flash

### 🟠 Mistral AI
1. Visit: https://console.mistral.ai/
2. Create API key
3. Add to `.env.local`: `MISTRAL_API_KEY=...`
4. **Models available**: Mistral Large, Codestral (coding), Mistral Small

### ⚡ Groq (Ultra-fast)
1. Visit: https://console.groq.com/keys
2. Create API key
3. Add to `.env.local`: `GROQ_API_KEY=...`
4. **Models available**: Llama 3.1 70B (500+ tokens/sec!), Mixtral 8x7B

### 🌊 DeepSeek
1. Visit: https://platform.deepseek.com/
2. Create API key
3. Add to `.env.local`: `DEEPSEEK_API_KEY=...`
4. **Models available**: DeepSeek Coder V2 (338 languages!)

### 🎯 Cohere
1. Visit: https://dashboard.cohere.com/api-keys
2. Create API key
3. Add to `.env.local`: `COHERE_API_KEY=...`
4. **Models available**: Command R+ (RAG optimized), Command R

### 🔍 Perplexity
1. Visit: https://perplexity.ai/api
2. Request API access
3. Add to `.env.local`: `PERPLEXITY_API_KEY=...`
4. **Models available**: Sonar Large/Small (Real-time web search)

### 🤝 Together AI
1. Visit: https://api.together.xyz/
2. Create account and API key
3. Add to `.env.local`: `TOGETHER_API_KEY=...`
4. **Models available**: Llama 3.1, CodeLlama, Qwen 2.5 Coder

### 🔄 Replicate
1. Visit: https://replicate.com/account/api-tokens
2. Create API token
3. Add to `.env.local`: `REPLICATE_API_TOKEN=...`
4. **Models available**: Various open-source models

### 🚀 xAI (Grok)
1. Visit: https://x.ai/api
2. Request access (may have waitlist)
3. Add to `.env.local`: `XAI_API_KEY=...`
4. **Models available**: Grok Beta (Real-time knowledge)

### 🤗 Hugging Face
1. Visit: https://huggingface.co/settings/tokens
2. Create access token
3. Add to `.env.local`: `HUGGINGFACE_API_KEY=...`
4. **Models available**: StarCoder2, Phi-2, Falcon 180B, 1000s more

### 🏠 Ollama (Local - Free!)
1. Install: https://ollama.ai
2. No API key needed!
3. Pull models: `ollama pull codellama:70b`
4. **Models available**: Any model from Ollama library

## Usage Examples

### Basic Usage
```typescript
import { aiManager } from './src/ai/EnhancedAIManager';

// AI Manager auto-initializes all providers with API keys from .env.local
const response = await aiManager.generateResponse('Write a React component');
```

### Switch Providers
```typescript
// Use Claude for high-quality code
aiManager.setProvider('anthropic', 'claude-3-5-sonnet-20241022');

// Use Groq for ultra-fast responses
aiManager.setProvider('groq', 'llama-3.1-70b-versatile');

// Use Gemini for huge context
aiManager.setProvider('google', 'gemini-1.5-pro');
```

### Vision Analysis
```typescript
// Analyze UI screenshots
aiManager.setProvider('anthropic', 'claude-3-5-sonnet-20241022');
const analysis = await aiManager.analyzeImage('./screenshot.png');

// Or use GPT-4 Vision
aiManager.setProvider('openai', 'gpt-4-vision-preview');
const analysis = await aiManager.analyzeImage('./design.jpg');
```

### Code Generation
```typescript
// Use specialized coding model
aiManager.setProvider('deepseek', 'deepseek-coder');
const code = await aiManager.generateCode('Create a REST API with Express');

// Or use Codestral
aiManager.setProvider('mistral', 'codestral-latest');
const code = await aiManager.generateCode('Implement binary search in Rust');
```

### Streaming
```typescript
// Stream responses for real-time display
for await (const chunk of aiManager.streamResponse(prompt)) {
  process.stdout.write(chunk);
}
```

## Testing Your Setup

### Test all providers
```bash
npm run test:ai
```

### Test specific provider
```typescript
const success = await aiManager.testConnection('openai');
console.log(success ? '✅ Connected' : '❌ Failed');
```

### Compare providers
```bash
npm run test:ai
# Select "Compare multiple providers"
```

## Recommended Providers by Use Case

### 🎨 UI/UX Analysis
1. **Claude 3.5 Sonnet** - Best vision understanding
2. **GPT-4 Vision** - Excellent pattern recognition
3. **Gemini 1.5 Pro** - Can analyze entire design systems

### 💻 Code Generation
1. **Claude 3.5 Sonnet** - Highest quality code
2. **DeepSeek Coder V2** - 338 language support
3. **Codestral** - Optimized for IDE integration

### 🚀 Real-time Apps
1. **Groq** - 500+ tokens/second
2. **Gemini Flash** - Fast multimodal
3. **GPT-3.5 Turbo** - Reliable and quick

### 💰 Budget-Friendly
1. **Claude 3 Haiku** - $0.25/1M tokens
2. **Gemini Flash** - $0.35/1M tokens
3. **Ollama** - Free (local)

### 🔐 Privacy-First
1. **Ollama** - 100% local
2. **Replicate** - Self-hosted options
3. **Together AI** - Deploy your own

## Troubleshooting

### Provider not working?
1. Check API key is correctly set in `.env.local`
2. Verify you have credits/payment method
3. Check rate limits
4. Run: `npm run test:ai` to diagnose

### Rate limited?
- Configure rate limits in `.env.local`:
  ```
  OPENAI_RATE_LIMIT=60
  ANTHROPIC_RATE_LIMIT=50
  ```

### Need help?
- Run setup script: `./scripts/setup-ai-providers.sh`
- Check provider status: `npm run test:ai`
- View all models: Select "List all available models"

## Pro Tips

1. **Use multiple providers**: Different models excel at different tasks
2. **Cache responses**: Enable with `ENABLE_AI_CACHE=true`
3. **Monitor costs**: Set up usage alerts with providers
4. **Test models**: Use the comparison tool to find best fit
5. **Local first**: Use Ollama for development to save costs

## Security Best Practices

1. **Never commit `.env.local`** to version control
2. **Rotate API keys** regularly
3. **Use environment-specific keys** for production
4. **Set spending limits** with each provider
5. **Monitor usage** for anomalies

Happy coding with AI! 🚀