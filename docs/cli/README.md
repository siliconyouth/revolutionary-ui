# CLI Reference

The Revolutionary UI Factory CLI provides powerful tools for analyzing projects, managing packages, and generating components.

## 🎯 Overview

The CLI automatically runs when you install the package, but you can also use it manually for more control over your development workflow.

## 🚀 Automatic Features

### Post-Install Setup
When you run `npm install @vladimirdukelic/revolutionary-ui-factory`, the CLI automatically:

1. **Analyzes** your project structure
2. **Detects** installed frameworks and libraries
3. **Runs AI analysis** for intelligent recommendations
4. **Installs** recommended packages
5. **Configures** your development environment
6. **Creates** example components

### Smart Detection
The CLI detects:
- 11 JavaScript frameworks
- 14 UI component libraries
- 15 icon libraries (75,000+ icons)
- 6 design tool integrations
- Build tools and bundlers
- Development tools

## 📋 Available Commands

### Authentication Commands

### `revolutionary-ui login`
Login to your Revolutionary UI account to access premium features.

```bash
revolutionary-ui login
```

Opens your browser to authenticate with your Revolutionary UI account. Once logged in, you'll have access to premium features based on your subscription plan.

### `revolutionary-ui logout`
Logout from your Revolutionary UI account.

```bash
revolutionary-ui logout
```

### `revolutionary-ui account`
Show current account information and available features.

```bash
revolutionary-ui account
# Alias: revolutionary-ui whoami
```

### Core Commands

### `revolutionary-ui analyze`
Analyze your project and get AI-powered recommendations.

```bash
revolutionary-ui analyze [options]

Options:
  -d, --detailed       Show detailed analysis
  -j, --json          Output as JSON
  -o, --output <file>  Save analysis to file
  --no-ai             Skip AI-powered analysis
```

**Example output:**
```
📊 Project Analysis Report

Project Summary:
  • Name: my-app
  • Package Manager: npm
  • TypeScript: ✅
  • Tailwind CSS: ✅

🤖 AI-Powered Insights:
  • Multiple frameworks detected. Consider consolidating.
  • Add Zustand for state management (40% less prop drilling)
  • Bundle size can be reduced by 30-50% with tree-shaking
```

### `revolutionary-ui setup`
Run the interactive setup wizard.

```bash
revolutionary-ui setup [options]

Options:
  -i, --interactive        Run in interactive mode (default)
  -a, --auto              Automatic mode with recommendations
  -u, --update            Update existing packages
  --dry-run               Preview changes without installing
  --force                 Force installation
  -p, --pm <manager>      Package manager (npm|yarn|pnpm|bun)
```

### `revolutionary-ui list`
List available packages by category.

```bash
revolutionary-ui list [category]

Categories:
  • frameworks    - JavaScript frameworks
  • ui           - UI component libraries
  • icons        - Icon libraries
  • design       - Design tool integrations
  • color        - Color manipulation tools
  • fonts        - Professional fonts
  • all          - Everything
```

### `revolutionary-ui info`
Display information about Revolutionary UI Factory.

```bash
revolutionary-ui info
```

Shows:
- Package statistics
- Feature overview
- Documentation links
- Version information

### `revolutionary-ui generate` (Coming Soon)
Generate components with massive code reduction.

```bash
revolutionary-ui generate <component> [options]

Options:
  -n, --name <name>     Component name
  -f, --framework <fw>  Target framework
  -o, --output <dir>    Output directory
```

### Premium Commands 🌟

### `revolutionary-ui marketplace` (Premium)
Browse and install marketplace components.

```bash
revolutionary-ui marketplace [action] [options]
# Alias: revolutionary-ui mp

Options:
  -s, --search <query>      Search for components
  -c, --category <category> Filter by category  
  -i, --install <component> Install a component
```

### `revolutionary-ui ai-generate` (Premium)
Generate components using AI from natural language prompts.

```bash
revolutionary-ui ai-generate <prompt> [options]
# Alias: revolutionary-ui ai

Options:
  -o, --output <path>      Output directory
  -f, --framework <fw>     Target framework
  --model <model>          AI model to use

Example:
  revolutionary-ui ai "Create a responsive pricing table with 3 tiers"
```

### `revolutionary-ui config-ai` (Pro/Enterprise)
Configure your own AI models for component generation.

```bash
revolutionary-ui config-ai
```

Supports:
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)
- Google (Gemini)
- Custom API endpoints
- Local models (Ollama, etc.)

### `revolutionary-ui team` (Team/Enterprise)
Manage team collaboration and permissions.

```bash
revolutionary-ui team [action] [options]

Options:
  --invite <email>    Invite team member
  --list             List team members
```

### `revolutionary-ui sync` (Pro/Enterprise)
Sync components and settings to cloud.

```bash
revolutionary-ui sync [action] [options]

Options:
  --push     Push local changes to cloud
  --pull     Pull cloud changes to local
  --status   Show sync status
```

### `revolutionary-ui analytics` (Premium)
View component usage analytics and insights.

```bash
revolutionary-ui analytics [options]
# Alias: revolutionary-ui stats

Options:
  -p, --period <period>    Time period (week|month|year)
  -c, --component <name>   Filter by component
```

### `revolutionary-ui library` (Pro/Enterprise)
Manage custom component library.

```bash
revolutionary-ui library [action] [options]
# Alias: revolutionary-ui lib

Options:
  --create <name>           Create new component
  --list                   List custom components
  --publish <component>    Publish to team library
```

### `revolutionary-ui registry` (Enterprise)
Manage private component registry.

```bash
revolutionary-ui registry [action] [options]

Options:
  --setup                  Setup private registry
  --publish <component>    Publish to registry
```

### `revolutionary-ui api` (Pro/Enterprise)
Direct access to Revolutionary UI API.

```bash
revolutionary-ui api [endpoint] [options]

Options:
  -m, --method <method>    HTTP method (default: GET)
  -d, --data <data>       Request data (JSON)

Available endpoints:
  /components    List available components
  /marketplace   Browse marketplace
  /analytics     Get usage analytics
  /team         Manage team members
  /account      Account information
```

### `revolutionary-ui support`
Get support (priority support for premium users).

```bash
revolutionary-ui support [issue]
```

## 🤖 AI-Powered Analysis

The AI analyzer provides intelligent insights:

### Project Insights
- Architecture pattern analysis
- Framework conflict detection
- Performance bottleneck identification
- Development setup evaluation

### Smart Recommendations
Each recommendation includes:
- **Category**: What type of improvement
- **Priority**: Critical, High, Medium, Low
- **Reasoning**: Why it's recommended
- **Impact**: Expected benefits
- **Code Examples**: How to implement

### Example AI Recommendation
```javascript
{
  category: 'State Management',
  recommendation: 'Add Zustand for state management',
  reasoning: 'Your React app has grown complex enough to benefit from centralized state management.',
  priority: 'high',
  packages: ['zustand'],
  estimatedImpact: '40% reduction in prop drilling, 60% faster feature development'
}
```

## ⚙️ Configuration

### Environment Variables
- `CI=true` - Skip automatic setup in CI environments
- `REVOLUTIONARY_UI_SKIP_SETUP=true` - Skip automatic setup

### Configuration File
After setup, `revolutionary-ui.config.js` is created:

```javascript
module.exports = {
  frameworks: ['react', 'next'],
  uiLibraries: ['@mui/material'],
  iconLibraries: ['lucide-react'],
  theme: {
    // Custom theme configuration
  },
  components: {
    // Component-specific settings
  }
}
```

### Setup Marker
`.revolutionary-ui-setup` file prevents repeated automatic setup.

## 💎 Premium Features & Subscription Plans

Revolutionary UI Factory offers both free and premium features:

### Free Plan
- ✅ Project analysis and recommendations
- ✅ Basic setup wizard
- ✅ Core component generation
- ✅ Framework detection
- ✅ Community support
- ✅ Documentation access

### Starter Plan ($19/month)
Everything in Free, plus:
- 🛍️ **Marketplace Access**: Browse and install premium components
- 🤖 **AI Generator**: Generate components from natural language
- 📊 **Basic Analytics**: Track component usage
- 🚀 **Priority Email Support**: 24-hour response time

### Pro Plan ($49/month)
Everything in Starter, plus:
- 🧠 **Custom AI Models**: Bring your own AI (OpenAI, Claude, etc.)
- ☁️ **Cloud Sync**: Sync across devices and teams
- 🎨 **Custom Component Library**: Build and manage your library
- 🔌 **API Access**: Programmatic access to all features
- 📊 **Advanced Analytics**: Detailed insights and reports
- 🚀 **Priority Support**: 2-hour response time

### Team Plan ($99/month per seat)
Everything in Pro, plus:
- 👥 **Team Collaboration**: Share components and settings
- 🔐 **SSO Integration**: Single sign-on support
- 📋 **Audit Logs**: Track all team activities
- 🎯 **Role-Based Access**: Manage permissions
- 🚀 **Dedicated Support**: 1-hour response time

### Enterprise Plan (Custom Pricing)
Everything in Team, plus:
- 🔒 **Private Registry**: Self-hosted component registry
- 🏷️ **White Label**: Custom branding options
- ♾️ **Unlimited Projects**: No limits on usage
- 🤝 **SLA Guarantee**: 99.9% uptime
- 🎯 **Custom Features**: Tailored to your needs
- 🚀 **Dedicated Account Manager**

To upgrade your plan, visit: https://revolutionary-ui.com/pricing

## 🎯 Common Workflows

### New Project Setup
```bash
# Create new project
npx create-react-app my-app
cd my-app

# Install and auto-setup
npm install @vladimirdukelic/revolutionary-ui-factory
```

### Existing Project Analysis
```bash
# Analyze without changes
revolutionary-ui analyze --detailed

# Update packages
revolutionary-ui setup --update
```

### CI/CD Integration
```bash
# Skip automatic setup in CI
CI=true npm install

# Or use --ignore-scripts
npm install --ignore-scripts
```

## 🔧 Troubleshooting

### Setup Didn't Run Automatically
- Check if you're in a CI environment
- Look for `.revolutionary-ui-setup` file
- Run manually: `revolutionary-ui setup`

### Package Conflicts
- Use `--legacy-peer-deps` for peer dependency issues
- Run `revolutionary-ui analyze` to check compatibility

### Permission Errors
- Use `npx` instead of global install
- Check npm permissions

## 📚 Advanced Usage

### Custom Package Sources
```bash
# Use custom registry
npm config set registry https://custom.registry.com
revolutionary-ui setup
```

### Programmatic Usage
```javascript
import { ProjectDetector, AIAnalyzer } from '@vladimirdukelic/revolutionary-ui-factory';

const detector = new ProjectDetector();
const analysis = await detector.analyze();

const aiAnalyzer = new AIAnalyzer(analysis);
const recommendations = await aiAnalyzer.generateRecommendations();
```

## 🚀 Next Steps

- [Installation Guide](./installation.md)
- [Command Reference](./commands.md)
- [AI Analysis Deep Dive](./ai-analysis.md)
- [Configuration Options](./configuration.md)

---

Need help? Run `revolutionary-ui --help` or visit [revolutionary-ui.com/docs](https://revolutionary-ui.com/docs)