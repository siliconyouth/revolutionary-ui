# Revolutionary UI Factory CLI

Transform your development with 60-95% less code! The Revolutionary UI Factory CLI helps you analyze, set up, and optimize your projects with intelligent recommendations and automated configuration.

## Features

- 🔍 **Intelligent Project Analysis** - Detects installed frameworks, libraries, and tools
- 🎯 **Smart Recommendations** - Get tailored suggestions based on your project
- 🚀 **Automated Setup** - Configure your project with a single command
- 📦 **100+ Packages** - Access to frameworks, UI libraries, icons, design tools, and more
- 🎨 **Design Tool Integration** - Import from Figma and Sketch
- 🔧 **Zero Configuration** - Works out of the box with sensible defaults

## Installation

```bash
# Install globally
npm install -g revolutionary-ui

# Or run directly with npx
npx revolutionary-ui
```

## Quick Start

```bash
# Analyze your project
revolutionary-ui analyze

# Run the setup wizard
revolutionary-ui setup

# Generate a component (coming soon)
revolutionary-ui generate button
```

## Commands

### `analyze`
Analyze your project and get detailed recommendations.

```bash
revolutionary-ui analyze [options]

Options:
  -d, --detailed       Show detailed analysis
  -j, --json          Output as JSON
  -o, --output <file>  Save analysis to file
```

### `setup`
Set up Revolutionary UI Factory for your project.

```bash
revolutionary-ui setup [options]

Options:
  -i, --interactive              Run in interactive mode (default)
  -a, --auto                     Run in automatic mode with recommended settings
  -u, --update                   Update existing packages to latest versions
  --dry-run                      Show what would be installed without making changes
  --force                        Force installation even if errors occur
  --skip-config                  Skip creating configuration files
  -p, --package-manager <pm>     Package manager to use (default: "npm")
```

### `generate` (Coming Soon)
Generate components with 60-95% less code.

```bash
revolutionary-ui generate [component] [options]

Options:
  -t, --type <type>      Component type (e.g., button, form, card)
  -l, --library <lib>    UI library to use
  -o, --output <path>    Output directory
```

### `list`
List available packages by category.

```bash
revolutionary-ui list [category] [options]

Categories:
  - frameworks
  - ui
  - icons
  - design
  - color
  - fonts
  - all

Options:
  -i, --installed  Show only installed packages
```

### `info`
Show information about Revolutionary UI Factory.

```bash
revolutionary-ui info
```

## Project Analysis

The CLI analyzes your project to detect:

- ✅ JavaScript frameworks (React, Vue, Angular, etc.)
- ✅ UI component libraries (Material-UI, Ant Design, etc.)
- ✅ Icon libraries (75,000+ icons available)
- ✅ Design tools and importers
- ✅ Development tools (TypeScript, ESLint, Prettier)
- ✅ Build tools and bundlers
- ✅ Testing frameworks

## Smart Recommendations

Based on your project analysis, the CLI provides:

- 📋 Missing features and their impact
- 🎯 Recommended packages for your stack
- ⚡ Optimization opportunities
- 📦 Update suggestions for outdated packages
- 🔧 Configuration improvements

## Interactive Setup Wizard

The setup wizard guides you through:

1. **Review Analysis** - See your project's current state
2. **Add Missing Features** - Install recommended packages
3. **Update Packages** - Upgrade to latest versions
4. **Browse Packages** - Explore additional options
5. **Configure Tools** - Set up TypeScript, ESLint, Prettier
6. **Generate Configs** - Create configuration files

## Example Workflow

```bash
# 1. Analyze your project
$ revolutionary-ui analyze

📊 Project Analysis Summary:

Project: my-app
Package Manager: npm
TypeScript: ✅
Tailwind CSS: ❌
ESLint: ✅
Prettier: ❌

Current Stack:
  Frameworks: React, Next.js
  UI Libraries: None
  
Coverage:
  Overall: 25%
  Frameworks: 100%
  UI Libraries: 0%
  Icons: 0%

💡 Recommendations:
  • No UI library detected. These libraries work great with React.
    Suggested: @mui/material, @chakra-ui/react, antd
    Priority: medium

# 2. Run setup wizard
$ revolutionary-ui setup

🏭 Revolutionary UI Factory Setup Wizard

Would you like to add the recommended missing features? (Y/n) Y

# 3. Install and configure
✅ Installed 15 packages
✅ Created 4 configuration files
✅ Updated package.json scripts

✨ Revolutionary UI Factory setup complete!
Start building amazing components with 60-95% less code.
```

## Configuration

After setup, a `revolutionary-ui.config.js` file is created:

```javascript
module.exports = {
  frameworks: ['react', 'next'],
  uiLibraries: ['@mui/material'],
  iconLibraries: ['lucide-react'],
  theme: {
    // Add your custom theme configuration here
  },
  components: {
    // Component-specific configurations
  }
}
```

## Development

To run the CLI in development mode:

```bash
# Clone the repository
git clone https://github.com/revolutionary-ui/factory

# Install dependencies
npm install

# Run CLI in development
npm run cli -- analyze
```

## Support

- 📚 Documentation: https://revolutionary-ui.com/docs
- 💬 Discord: https://discord.gg/revolutionary-ui
- 🐛 Issues: https://github.com/revolutionary-ui/factory/issues

## License

MIT © Revolutionary UI Factory