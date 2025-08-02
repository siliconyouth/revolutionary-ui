# Revolutionary UI v3.0 - AI-Powered Interactive CLI

[![npm version](https://badge.fury.io/js/@vladimirdukelic%2Frevolutionary-ui-factory.svg)](https://www.npmjs.com/package/@vladimirdukelic/revolutionary-ui-factory)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![Components](https://img.shields.io/badge/Components-150%2B-brightgreen)](https://github.com/siliconyouth/revolutionary-ui-factory-system)
[![Frameworks](https://img.shields.io/badge/Frameworks-10%2B-blue)](https://github.com/siliconyouth/revolutionary-ui-factory-system)
[![Website](https://img.shields.io/badge/Website-revolutionary--ui.com-ff69b4)](https://revolutionary-ui.com)

> Generate ANY UI component for ANY framework with 60-95% code reduction! 🚀

🌐 **Visit our website & interactive hub**: [https://revolutionary-ui.com](https://revolutionary-ui.com)

## 🎯 What is Revolutionary UI Factory?

Revolutionary UI Factory is a complete ecosystem designed to revolutionize UI development. It combines a powerful npm package, an intelligent CLI, a VSCode extension, and a full-featured web-based development hub to help you build high-quality UI components with 60-95% less code.

### 🌟 Key Highlights

- **150+ Component Types**: From basic buttons to complex dashboards, kanban boards, and charts.
- **10+ Frameworks**: React, Vue, Angular, Svelte, Solid, and more.
- **Interactive Web Hub**: Visually build components, analyze repositories, and manage your account on our website.
- **🎨 Visual Component Builder**: NEW! Drag-and-drop interface for building components visually with real-time preview.
- **Intelligent CLI**: Automates project setup, provides AI-powered analysis, and generates components.
- **VSCode Extension**: Supercharge your workflow with snippets and real-time metrics.
- **Pluggable Architecture**: Works with any style system (Tailwind, CSS-in-JS, etc.) and is fully extensible.

## 🚀 The Ecosystem

### 1. The Website & Development Hub ([revolutionary-ui.com](https://revolutionary-ui.com))

Our website is the central hub for the entire ecosystem. It's not just for documentation; it's a powerful, interactive tool:

- **Component Browser**: Explore all 150+ components with live examples.
- **Interactive Playground**: Visually configure components, edit their properties in real-time, and instantly get production-ready code for any framework.
- **Visual Component Builder**: NEW! Drag-and-drop interface for building components visually:
  - Real-time preview with device modes (Desktop, Tablet, Mobile)
  - Property panels for easy customization
  - Export to factory configuration or framework-specific code
  - Pre-built templates for common layouts
  - Undo/redo support with full history
- **AI Playground**: Describe the component you need in plain English and let our AI generate it for you.
- **Project Analyzer**: Paste a link to a public GitHub repository and get detailed analysis and recommendations for improvement.
- **Dashboard**: Manage your account, subscription, team members, and view detailed analytics on your component usage.

### 2. The Core NPM Package (`@vladimirdukelic/revolutionary-ui-factory`)

The heart of the system. A lightweight, powerful package that you install in your project to enable component generation.

```bash
npm install @vladimirdukelic/revolutionary-ui-factory
```

### 3. The Intelligent CLI (`revolutionary-ui`)

Bundled with the npm package, our CLI is a powerful tool for local development:

- **Automatic Setup**: On install, it analyzes your project and provides tailored recommendations.
- **Local Generation**: Scaffold components directly from your terminal.
- **Premium Features**: Log in to your account to access premium features like the AI generator, marketplace, and team management right from the command line.

```bash
# Login to your account
revolutionary-ui login

# Analyze your project
revolutionary-ui analyze

# Generate a component
revolutionary-ui generate table --name UserTable
```

### 4. The VSCode Extension

Search for "Revolutionary UI Factory" in the VSCode Marketplace to get:
- **Code Snippets**: `rfdb`, `rfkb`, `rfdt` for instant dashboard, kanban, and table generation.
- **IntelliSense**: Autocompletion for factory methods and configurations.
- **Real-time Metrics**: See your code reduction savings as you work.

## 💎 Premium Features

Revolutionary UI Factory offers a robust free tier, with premium plans for professional developers and teams:

- 🛍️ **Component Marketplace**: Full e-commerce marketplace with real backend:
  - **Browse & Search**: Filter by framework, category, price, and rating
  - **Purchase Premium Components**: Secure Stripe payment processing
  - **Publish Your Components**: Share and monetize (70% revenue share)
  - **Version Control**: Track updates and changelogs
  - **Reviews & Ratings**: Community feedback system
  - **User Library**: Manage purchased, favorite, and published components
- 🤖 **AI Generator**: Create components from natural language prompts with real AI providers:
  - **OpenAI** (GPT-4, GPT-3.5): Best for complex components
  - **Anthropic** (Claude 3): Excellent for detailed explanations
  - **Google Gemini**: Fast and cost-effective
  - **Mistral**: Great balance of speed and quality
- 🔄 **Streaming Generation**: Real-time AI responses with progress updates
- 💡 **Context-Aware Suggestions**: AI analyzes your project for intelligent recommendations
- 🔧 **Code Analysis**: AI-powered performance, accessibility, and security checks
- 🌐 **Framework Transformation**: Convert components between React, Vue, Angular, and more
- 👥 **Team Collaboration**: Share components, configurations, and manage access.
- ☁️ **Cloud Sync**: Sync your components and settings across devices.
- 📊 **Advanced Analytics**: Get deep insights into your component usage and code savings.
- 🔒 **Private Registry**: For enterprise teams to host their own secure component libraries.

👉 **Get started for free**: [revolutionary-ui.com](https://revolutionary-ui.com)  
💳 **View plans**: [revolutionary-ui.com/pricing](https://revolutionary-ui.com/pricing)

## 🚀 Quick Start

The fastest way to get started is on our website:

1.  **Visit [revolutionary-ui.com/playground](https://revolutionary-ui.com/playground)**.
2.  Select a component and a framework.
3.  Customize the properties in the live editor.
4.  Copy the generated code into your project.

It's that simple. You don't need to write hundreds of lines of boilerplate ever again.

## 🤖 AI Integration

### Quick Setup

1. **Configure AI Providers**: Add your API keys to `.env.local`:
   ```bash
   OPENAI_API_KEY=sk-...
   ANTHROPIC_API_KEY=sk-ant-...
   GOOGLE_AI_API_KEY=...
   MISTRAL_API_KEY=...
   ```

2. **Generate with AI**: Use natural language to create components:
   ```bash
   revolutionary-ui generate --ai "Create a responsive pricing table with monthly/yearly toggle"
   ```

3. **Web Interface**: Visit `/dashboard/ai-generate` for a visual AI component generator with:
   - Multiple AI model selection
   - Real-time streaming responses
   - Framework and styling options
   - Code variations and metrics

4. **Programmatic Usage**:
   ```typescript
   import { aiProviderManager } from '@revolutionary/ui-factory'
   
   const provider = aiProviderManager.getProvider('openai')
   const response = await provider.generateComponent(
     'Create a user profile card with avatar and stats',
     { framework: 'React', styleSystem: 'tailwind' }
   )
   ```

See the full [AI Integration Guide](./docs/AI_INTEGRATION.md) for detailed documentation.

## 🤖 Claude Code Integration

Revolutionary UI Factory is optimized for AI-assisted development with Claude Code. We follow best practices in context engineering:

- **CLAUDE.md**: Contains project-specific guidance and instructions
- **CLAUDE_CONTEXT.md**: Comprehensive context file with technical details, patterns, and conventions
- **Automatic Context Loading**: Claude automatically reads these files for optimal assistance

### Working with Claude Code

```bash
# Claude will automatically read CLAUDE.md and CLAUDE_CONTEXT.md
# Just start working on your task!

# For best results:
# 1. Keep context files updated
# 2. Use the # key to add persistent instructions
# 3. Leverage multiple Claude instances for code review
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on how to get started.

## 📝 License

This project is licensed under the MIT License. See the LICENSE file for details.
