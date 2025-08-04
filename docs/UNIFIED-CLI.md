# Revolutionary UI Unified CLI

## Overview

The Revolutionary UI v3.2.0 introduces a unified CLI that intelligently combines all previous CLI implementations into a single, context-aware command-line interface.

## Architecture

The unified CLI (`revolutionary-ui`) acts as an intelligent router that:

1. **Analyzes context** - Detects project type and configuration
2. **Routes commands** - Directs to the appropriate CLI implementation
3. **Provides consistency** - Single entry point for all features

## Command Routing

| Command | Routes To | Description |
|---------|-----------|-------------|
| `create`, `new` | create-app.ts | Project creation wizard |
| `analyze` | factory/cli.ts | AI-powered project analysis |
| `generate`, `g` | cli/index.ts | Component generation |
| `setup`, `init` | simple-wizard.ts | Setup wizard |
| `auth`, `team`, `cloud` | cli/index.ts | Advanced features |
| `monitor`, `catalog`, `marketplace` | cli/index.ts | v3.0 features |
| (no command) | Context-based | Interactive wizard |

## Context-Aware Behavior

The CLI automatically selects the appropriate interface based on:

### No Project Directory
- Shows setup wizard
- Offers project creation
- Guides through initial setup

### Existing Project (No Revolutionary UI)
- Suggests adding Revolutionary UI
- Runs compatibility analysis
- Provides setup wizard

### Revolutionary UI Project
- Full interactive wizard (revolutionary-cli.ts)
- Access to all features
- Team and cloud capabilities

## Usage Examples

### Basic Commands
```bash
# Start interactive wizard (context-aware)
revolutionary-ui

# Create new project
revolutionary-ui create my-app

# Generate components
revolutionary-ui generate table

# Analyze project
revolutionary-ui analyze

# Setup in existing project
revolutionary-ui setup
```

### Advanced Features
```bash
# Authentication
revolutionary-ui auth login

# Team management
revolutionary-ui team invite user@example.com

# Cloud sync
revolutionary-ui cloud push

# Component catalog
revolutionary-ui catalog browse

# Marketplace
revolutionary-ui marketplace search "dashboard"
```

## Implementation Details

### Entry Point
- `/bin/revolutionary-ui` - Main entry point
- Supports both development (TypeScript) and production (JavaScript)
- Handles command routing and context detection

### CLI Implementations
1. **cli/index.ts** - v3.0 CLI with full features
2. **cli/revolutionary-cli.ts** - Interactive wizard interface
3. **cli/simple-wizard.ts** - Simple setup wizard
4. **cli/create-app.ts** - Project creation
5. **lib/factory/cli.ts** - Factory system CLI

### Features by Implementation

| Feature | index.ts | revolutionary-cli.ts | simple-wizard.ts | factory/cli.ts |
|---------|----------|---------------------|------------------|----------------|
| Component Generation | ✅ | ✅ | ❌ | ✅ |
| AI Analysis | ✅ | ✅ | ✅ | ✅ |
| Authentication | ✅ | ✅ | ❌ | ✅ |
| Team Features | ✅ | ✅ | ❌ | ❌ |
| Cloud Sync | ✅ | ✅ | ❌ | ❌ |
| Monitoring | ✅ | ✅ | ❌ | ❌ |
| Marketplace | ✅ | ✅ | ❌ | ✅ |
| Interactive Wizard | ❌ | ✅ | ✅ | ✅ |
| Project Creation | ❌ | ✅ | ✅ | ❌ |

## Configuration

The CLI respects the following configuration files:
- `.revolutionary-ui.json` - Project configuration
- `~/.revolutionary-ui/config.json` - User configuration
- `.env.local` - Environment variables

## Development

### Running in Development
```bash
# The CLI automatically detects development mode
./bin/revolutionary-ui [command]
```

### Building for Production
```bash
npm run build:cli
```

### Testing
```bash
# Test help
./bin/revolutionary-ui help

# Test version
./bin/revolutionary-ui version

# Test in empty directory
cd /tmp && revolutionary-ui

# Test in project directory
cd my-project && revolutionary-ui
```

## Migration Guide

### From v2.x
```bash
# Old
create-factory [command]
revolutionary-ui-factory [command]

# New
revolutionary-ui [command]
```

### From v3.0
```bash
# Old (multiple entry points)
rui [command]
rui-wizard
create-revolutionary-app

# New (single entry point)
revolutionary-ui [command]
```

## Troubleshooting

### Common Issues

1. **"CLI not found" error**
   - Run `npm run build` to compile the CLI
   - Ensure proper installation with `npm install -g revolutionary-ui`

2. **TypeScript errors in development**
   - Ensure `tsx` is installed: `npm install tsx`
   - Check TypeScript version compatibility

3. **Command not recognized**
   - Use `revolutionary-ui help` to see available commands
   - Check spelling and command syntax

### Debug Mode
```bash
# Enable debug output
DEBUG=revolutionary:* revolutionary-ui [command]
```

## Future Enhancements

- [ ] Plugin system for custom commands
- [ ] Shell completion support
- [ ] Offline mode with cached data
- [ ] Multi-language support
- [ ] Voice command integration