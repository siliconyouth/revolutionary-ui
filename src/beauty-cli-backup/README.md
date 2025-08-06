# RevUI CLI 🚀

Revolutionary UI CLI - AI-powered component generation factory system with a beautiful terminal interface built with Ink (React for CLIs) and TypeScript.

## Features

### Core Functionality
- 🤖 **AI-Powered Generation** - Generate components with 60-95% code reduction
- 🔍 **Smart Analysis** - Deep project analysis with AI recommendations
- 🔎 **Semantic Search** - Search 10,000+ components with natural language
- 🏭 **Factory Patterns** - Browse 150+ component factories
- 💬 **AI Assistant** - Chat with GPT-4, Claude, and Gemini
- ☁️ **Cloud Sync** - Sync components across devices with R2 storage
- 📚 **Templates** - Production-ready templates for quick starts
- 📝 **Doc Generation** - AI-powered documentation from code
- ⚙️ **Settings** - Configure AI providers and preferences

### UI Features
- 🎨 **React-based Terminal UI** - Built with Ink for declarative development
- 🌈 **Beautiful Interface** - Gradients, colors, and smooth transitions
- ⌨️ **Intuitive Navigation** - Arrow keys, Enter, ESC shortcuts
- 📊 **Real-time Updates** - Live metrics and progress tracking
- 🎯 **TypeScript** - Full type safety and modern development

### Advanced Dashboard Components
- 📈 **AsciiChart** - Terminal-based line charts with customizable colors
- 🎯 **Gauge** - Circular progress indicators with thresholds
- ⏳ **ProgressBar** - Horizontal progress bars with labels
- 📊 **SparkLine** - Inline mini charts for quick metrics
- 📋 **DataTable** - Formatted data tables with column support
- 📜 **LiveLog** - Real-time log viewer with severity levels
- 🌐 **NetworkMonitor** - API status and latency monitoring
- 🏗️ **DashboardGrid** - Flexible grid layout system

## Quick Start

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run the CLI
./run-revui.sh

# Or run specific commands
./run-revui.sh generate         # AI component generation
./run-revui.sh analyze          # Project analysis
./run-revui.sh search "table"   # Search components
./run-revui.sh chat             # AI assistant
```

## Development

```bash
# Run in development mode with hot reload
npm run dev

# Type check
npm run type-check

# Build for production
npm run build
```

## Project Structure

```
revui/
├── src/
│   ├── cli.tsx              # CLI entry point
│   ├── App.tsx              # Main app component with routing
│   ├── components/          # Reusable UI components
│   │   ├── Header.tsx       # Gradient header with borders
│   │   ├── Footer.tsx       # Help text and navigation hints
│   │   ├── MenuItem.tsx     # Interactive menu items
│   │   ├── Panel.tsx        # Bordered content panels
│   │   ├── AnimatedText.tsx # Typewriter effect text
│   │   ├── AsciiChart.tsx   # Terminal line charts
│   │   ├── DataTable.tsx    # Formatted data tables
│   │   ├── DashboardGrid.tsx # Grid layout system
│   │   ├── Gauge.tsx        # Circular progress indicators
│   │   ├── LiveLog.tsx      # Real-time log viewer
│   │   ├── NetworkMonitor.tsx # API status monitor
│   │   ├── ProgressBar.tsx  # Progress indicators
│   │   ├── SparkLine.tsx    # Mini inline charts
│   │   ├── MultiWindowLayout.tsx # Split-pane layouts
│   │   └── Sidebar.tsx      # Persistent navigation menu
│   ├── screens/             # Application screens
│   │   ├── WelcomeScreen.tsx    # Animated welcome splash
│   │   ├── DashboardScreen.tsx  # Advanced metrics dashboard
│   │   ├── GenerateScreen.tsx   # AI component generation
│   │   ├── AnalyzeScreen.tsx    # Project analysis with grid
│   │   ├── SearchScreen.tsx     # Component search
│   │   ├── ChatScreen.tsx       # AI assistant chat
│   │   ├── SyncScreen.tsx       # Cloud sync
│   │   ├── TemplatesScreen.tsx  # Template browser
│   │   ├── DocsScreen.tsx       # Documentation viewer
│   │   ├── FactoryScreen.tsx    # Factory browser
│   │   ├── SettingsScreen.tsx   # Interactive settings
│   │   └── AboutScreen.tsx      # About information
│   └── hooks/               # Custom React hooks
│       ├── useAnimation.ts  # Animation utilities
│       └── useTerminalSize.ts # Terminal dimensions
├── package.json
├── tsconfig.json
└── README.md
```

## Key Technologies

- **[Ink](https://github.com/vadimdemedes/ink)** - React for building CLI apps
- **[@inkjs/ui](https://github.com/vadimdemedes/ink-ui)** - Pre-built Ink components
- **[ink-gradient](https://github.com/sindresorhus/ink-gradient)** - Beautiful text gradients
- **[ink-big-text](https://github.com/sindresorhus/ink-big-text)** - ASCII art text
- **[ink-spinner](https://github.com/vadimdemedes/ink-spinner)** - Loading spinners
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety and modern JS

## Screenshots

### Welcome Screen
- Rainbow gradient "BEAUTY" text
- Loading spinner animation
- Version badge

### Main Menu
- Arrow key navigation
- Highlighted selection
- Descriptive menu items
- NEW badges for features

### Dashboard
- Real-time system metrics
- Progress bars for CPU/Memory/Disk
- Active process monitoring
- Recent activity log

### Settings
- Interactive form fields
- Tab navigation
- Select dropdowns
- Text input fields

## Customization

The CLI is designed to be easily customizable:

1. **Colors** - Modify color schemes in components
2. **Animations** - Adjust timing in `useAnimation` hook
3. **Layout** - Flexbox-based responsive design
4. **Components** - Add new screens and components

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT

---

Built with ❤️ using the Ink ecosystem