# AI Authentication Guide for Revolutionary UI

Revolutionary UI uses Claude AI to provide intelligent assistance throughout your development workflow. Here are three ways to set it up:

## Quick Start

### Option 1: Browser Session (NEW - Recommended)

Simple browser authentication with your Claude.ai account - no API limits!

```bash
# 1. Run the authentication command
revolutionary-ui ai-auth

# 2. Select "Browser Session (No API limits)"
# 3. Log in to Claude.ai in your browser
# 4. Visit https://claude.ai/api/auth/session
# 5. Copy the sessionKey value and paste it
```

This method:
- ✅ No API rate limits
- ✅ Uses your Claude.ai subscription
- ✅ Simple copy-paste setup
- ✅ Session persists for 30 days
- ✅ Secure storage (keychain on macOS)

### Option 2: Use Claude Code

Claude Code provides official CLI integration:

```bash
# 1. Install Claude Code globally
npm install -g claude

# 2. Login to Claude
claude login

# 3. Use Revolutionary UI normally - it will detect Claude Code automatically
revolutionary-ui ai-interactive
```

### Option 3: Use API Key

Traditional API key authentication:

```bash
# 1. Run the authentication command
revolutionary-ui ai-auth

# 2. Select "Use API Key"
# 3. Enter your Anthropic API key
```

Get your API key from: https://console.anthropic.com/settings/keys

## Checking Authentication Status

```bash
revolutionary-ui ai-auth --status
```

## How It Works

### With Browser Session
- **No API rate limits** - Unlimited usage
- **Uses your Claude.ai subscription** - No additional costs
- **Simple authentication** - Just visit a URL and copy-paste
- **Persistent sessions** - Valid for 30 days
- **Secure storage** - Uses system keychain when available
- **Best for heavy usage** - Ideal for AI-intensive workflows

### With Claude Code
- No API rate limits
- Uses your Claude.ai subscription
- Automatic session management
- Official Anthropic CLI

### With API Key
- Traditional method
- Subject to rate limits
- Good for light usage
- Direct API access

## Troubleshooting

### "AI not authenticated" error
Run `revolutionary-ui ai-auth` to set up authentication.

### Rate limit errors with API key
Consider switching to Claude Code for unlimited access.

### Claude Code not detected
Make sure Claude Code is installed globally and you're logged in:
```bash
claude --version
claude login
```

## Integration with Revolutionary UI

Once authenticated, AI features are available throughout the CLI:

- **AI Interactive Mode**: `revolutionary-ui ai-interactive`
- **AI-Powered Analysis**: `revolutionary-ui analyze --ai`
- **Smart Setup**: `revolutionary-ui setup --with-ai`
- **AI Generation**: `revolutionary-ui ai-generate`

All commands will automatically use your authentication method.