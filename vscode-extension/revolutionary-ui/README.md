# Revolutionary UI - VS Code Extension

![Revolutionary UI Logo](images/icon.png)

Browse, search, and insert UI components from Revolutionary UI directly in VS Code. Access thousands of production-ready components with AI-powered search and generation.

## Features

### 🔍 AI-Powered Semantic Search
- Search components using natural language
- Find components by description, not just keywords
- Get relevance scores for search results

### 🎨 Component Explorer
- Browse components by category
- View component details and metadata
- Preview components before inserting

### ✨ AI Component Generation
- Generate components from natural language descriptions
- Support for React, Vue, Angular, Svelte, and Vanilla JS
- Powered by GPT-4

### 📦 Smart Insertion
- Insert components at cursor position
- Create new files with components
- Copy to clipboard option

### ⭐ Favorites & Recent
- Mark frequently used components as favorites
- Track recently used components
- Quick access from the sidebar

### 🔧 IntelliSense Integration
- Component suggestions while typing
- Framework-aware completions
- Inline documentation

## Installation

1. Open VS Code
2. Press `Ctrl+P` / `Cmd+P` to open the Quick Open dialog
3. Type `ext install revolutionary-ui.revolutionary-ui`
4. Click Install

Or search for "Revolutionary UI" in the Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`).

## Getting Started

### 1. Configure API Access

Open VS Code settings (`Ctrl+,` / `Cmd+,`) and search for "Revolutionary UI":

```json
{
  "revolutionaryUI.apiUrl": "https://revolutionary-ui.com/api",
  "revolutionaryUI.apiKey": "your-api-key",
  "revolutionaryUI.defaultFramework": "react"
}
```

### 2. Search Components

- **Command Palette**: `Ctrl+Shift+P` → "Revolutionary UI: Search Components"
- **Keyboard Shortcut**: `Ctrl+Shift+U` / `Cmd+Shift+U`
- **Activity Bar**: Click the Revolutionary UI icon

### 3. Generate with AI

1. Select text describing your component
2. Right-click → "Generate Component with AI"
3. Or use Command Palette: "Revolutionary UI: Generate Component with AI"

**Note**: Requires OpenAI API key in settings:
```json
{
  "revolutionaryUI.openAIKey": "sk-..."
}
```

## Usage

### Search Components
```
Ctrl+Shift+U (Cmd+Shift+U on Mac)
```
Type natural language queries like:
- "responsive data table with sorting"
- "authentication form with validation"
- "dashboard layout with sidebar"

### Insert Component
```
Ctrl+Shift+I (Cmd+Shift+I on Mac)
```
Or right-click in editor → "Insert Component at Cursor"

### Component Explorer
1. Click Revolutionary UI icon in Activity Bar
2. Browse by category
3. Click component to preview
4. Double-click to insert

### IntelliSense
Start typing `<` in JSX/TSX files to see component suggestions.

## Configuration

| Setting | Description | Default |
|---------|-------------|---------|
| `revolutionaryUI.apiUrl` | API endpoint URL | `https://revolutionary-ui.com/api` |
| `revolutionaryUI.apiKey` | API key for authenticated requests | `""` |
| `revolutionaryUI.defaultFramework` | Default framework for components | `"react"` |
| `revolutionaryUI.insertMode` | How to insert components | `"inline"` |
| `revolutionaryUI.enableAI` | Enable AI-powered features | `true` |
| `revolutionaryUI.openAIKey` | OpenAI API key for AI generation | `""` |
| `revolutionaryUI.cacheTimeout` | Cache timeout in seconds | `3600` |

### Insert Modes

- **inline**: Insert at current cursor position
- **newFile**: Create new file with component
- **clipboard**: Copy component to clipboard

## Commands

| Command | Description | Shortcut |
|---------|-------------|----------|
| `Search Components` | Open semantic search | `Ctrl+Shift+U` |
| `Insert Component` | Insert at cursor | `Ctrl+Shift+I` |
| `Browse Component Library` | Open component browser | - |
| `Generate Component with AI` | Generate from description | - |
| `Show Preview` | Preview selected component | - |
| `Open Settings` | Open extension settings | - |
| `Refresh Components` | Clear cache and refresh | - |

## Features in Detail

### Semantic Search
Uses OpenAI embeddings to understand the meaning of your search query:
- Finds components by functionality, not just names
- Returns similarity scores
- Filters by framework and category

### AI Generation
Generates complete components from descriptions:
- Supports all major frameworks
- Uses GPT-4 for high-quality code
- Includes TypeScript types
- Follows best practices

### Component Preview
Preview components before inserting:
- Live preview in webview
- Syntax highlighted code
- Framework switching
- Export options

### Caching
Intelligent caching for better performance:
- Component metadata cached for 1 hour
- Search results cached for 10 minutes
- Manual refresh available

## Troubleshooting

### "API Key not configured"
1. Get your API key from [revolutionary-ui.com](https://revolutionary-ui.com)
2. Add to settings: `revolutionaryUI.apiKey`

### "OpenAI API key not found"
1. Get OpenAI API key from [platform.openai.com](https://platform.openai.com)
2. Add to settings: `revolutionaryUI.openAIKey`

### Components not loading
1. Check internet connection
2. Verify API URL is correct
3. Try refreshing: Command Palette → "Refresh Components"

### Search not working
1. Ensure semantic search is enabled on server
2. Check that query is at least 2 characters
3. Try different search terms

## Privacy & Security

- API keys are stored locally in VS Code settings
- No telemetry or usage tracking
- Components are fetched on-demand
- Cache is stored in memory only

## Support

- **Documentation**: [revolutionary-ui.com/docs](https://revolutionary-ui.com/docs)
- **Issues**: [GitHub Issues](https://github.com/siliconyouth/revolutionary-ui/issues)
- **Email**: support@revolutionary-ui.com

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Made with ❤️ by the Revolutionary UI team