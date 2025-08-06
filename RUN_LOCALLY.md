# Running Revolutionary UI Locally

Since you're developing Revolutionary UI locally, don't use `npx revolutionary-ui` as that tries to download from npm.

## Correct Commands for Local Development

### 1. Using npm scripts (recommended)
```bash
# Run the CLI directly
npm run cli

# Run with arguments
npm run cli -- analyze
npm run cli -- generate
npm run cli -- catalog
```

### 2. Using the binary directly
```bash
# Make sure it's executable
chmod +x ./bin/revolutionary-ui

# Run it
./bin/revolutionary-ui
./bin/revolutionary-ui ui
./bin/revolutionary-ui --help
```

### 3. Using node/tsx directly
```bash
# For TypeScript files
tsx src/cli/index.ts
tsx src/cli/index.ts ui
tsx src/cli/index.ts analyze

# For the standalone terminal UI
./revolutionary-ui-terminal
```

### 4. Creating a local alias (optional)
```bash
# Add to your ~/.bashrc or ~/.zshrc
alias rui-dev="node /Users/vladimir/projects/revolutionary-ui/bin/revolutionary-ui"

# Then use
rui-dev
rui-dev ui
rui-dev generate
```

### 5. Using npm link for global access (best for testing)
```bash
# In the revolutionary-ui directory
npm link

# Now you can use it globally (without npx)
revolutionary-ui
rui
```

## Quick Start for Terminal UI

1. **Direct execution:**
   ```bash
   ./revolutionary-ui-terminal
   ```

2. **Via npm script:**
   ```bash
   npm run cli
   ```

3. **Via binary:**
   ```bash
   ./bin/revolutionary-ui
   ```

## Notes

- Never use `npx revolutionary-ui` for local development
- The `npx` command is only for users who have installed the package from npm
- For development, always use one of the methods above