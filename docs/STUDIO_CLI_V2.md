# Revolutionary UI Studio CLI v2

A powerful, feature-rich terminal interface for Revolutionary UI with stunning graphics, animations, and comprehensive functionality.

## Features

### 🎨 Rich Graphics & Animations
- **Animated Splash Screen**: Beautiful gradient titles with loading animations
- **Real-time Visualizations**: Live charts, graphs, and metrics
- **Progress Indicators**: Multiple progress bar styles and spinners
- **ASCII Art Components**: Visual component previews in terminal
- **Color Gradients**: Rainbow, crystal, mind, passion, and retro gradients

### 📊 Dashboard
- **Live Metrics**: Real-time code reduction percentage
- **Performance Sparklines**: Animated performance graphs
- **Activity Log**: Streaming activity updates
- **Component Statistics**: Framework usage tables
- **Interactive Navigation**: Mouse and keyboard support

### 🔍 Component Browser
- **Category Navigation**: Browse by component type
- **ASCII Preview**: See components rendered as ASCII art
- **Component Details**: Size, features, and compatibility info
- **Search Functionality**: Fast component search
- **Framework Filters**: Filter by React, Vue, Angular, etc.

### 🤖 AI Assistant
- **Multi-Model Support**: GPT-4, Claude 3.5, Gemini, Llama
- **Interactive Chat**: Full chat interface with history
- **Quick Actions**: One-click component generation
- **Context Awareness**: Understands your project structure
- **Code Generation**: Creates components on demand

### 📈 Analytics
- **Line Charts**: Component generation trends
- **Bar Charts**: Framework usage statistics
- **Donut Charts**: Component type distribution
- **Key Metrics**: Time saved, code reduction, active projects
- **Export Options**: Save analytics data

### ⚙️ Settings
- **AI Configuration**: API keys and model selection
- **Appearance**: Theme and color customization
- **Cloud Services**: Sync and backup options
- **Build Options**: Framework preferences
- **Security**: Access control and encryption

## Installation

```bash
# Install Revolutionary UI globally
npm install -g revolutionary-ui

# Or run directly with npx
npx revolutionary-ui studio
```

## Usage

### Starting the Studio

```bash
# Using the installed command
rui-studio

# Using npm script
npm run studio

# With debug mode
rui-studio --debug
```

### Navigation

- **Number Keys (1-5)**: Navigate between sections
- **Tab**: Move focus between elements
- **Enter**: Select/activate current item
- **ESC**: Go back or cancel
- **Q**: Quit the application
- **H**: Show help screen
- **R**: Refresh current view

### Mouse Support

- Click on any interactive element
- Scroll with mouse wheel
- Drag to select text
- Right-click for context menu (where available)

## Architecture

The Studio CLI is built with:

- **blessed**: Core terminal UI framework
- **blessed-contrib**: Charts and visualizations
- **chalk-animation**: Animated text effects
- **figlet**: ASCII art text generation
- **gradient-string**: Color gradients
- **ora**: Elegant spinners
- **cli-progress**: Progress bars
- **asciichart**: Terminal charts

## Sections Overview

### 1. Dashboard
The main hub showing:
- Code reduction gauge (60-95% savings)
- Real-time generation performance
- Activity log with recent actions
- Component statistics by framework

### 2. Component Browser
Browse and preview components:
- Categorized component list
- ASCII art previews
- Detailed specifications
- One-click generation

### 3. AI Assistant
Intelligent code generation:
- Natural language requests
- Multiple AI model support
- Context-aware suggestions
- Real-time code preview

### 4. Analytics
Project insights:
- Generation trends over time
- Framework usage breakdown
- Component type distribution
- Performance metrics

### 5. Settings
Configure your experience:
- API credentials
- Default frameworks
- UI preferences
- Export options

## Advanced Features

### Component Preview
Components are rendered as ASCII art for quick visualization:

```
┌─────────────────────────┐
│  Dynamic Form Preview   │
├─────────────────────────┤
│ Name:    [___________]  │
│ Email:   [___________]  │
│ Role:    [▼ Select  ]  │
│                         │
│ ☐ Subscribe to updates  │
│                         │
│ [Submit] [Cancel]       │
└─────────────────────────┘
```

### Real-time Metrics
Live updates every 2 seconds showing:
- Current code reduction percentage
- Generation performance sparkline
- Activity stream
- Resource usage

### Multi-Model AI Support
Switch between AI providers:
- OpenAI GPT-4o
- Anthropic Claude 3.5
- Google Gemini
- Meta Llama 3
- Local models (Ollama)

## Customization

### Themes
The Studio supports multiple color themes:
- Default (Cyan/Blue)
- Dark Mode
- High Contrast
- Custom RGB values

### Layout
Responsive 12x12 grid system that adapts to terminal size.

## Troubleshooting

### Terminal Compatibility
For best experience, use:
- iTerm2 (macOS)
- Windows Terminal
- Hyper
- Alacritty

### Performance
- Disable animations for slower systems
- Reduce update frequency in settings
- Use simplified charts mode

### Common Issues

1. **Colors not displaying correctly**
   - Ensure your terminal supports 256 colors
   - Set `TERM=xterm-256color`

2. **Mouse not working**
   - Enable mouse support in terminal settings
   - Try different terminal emulator

3. **Charts not rendering**
   - Check terminal Unicode support
   - Use ASCII fallback mode

## Future Enhancements

- [ ] Plugin system for custom widgets
- [ ] Export to various formats (PDF, HTML)
- [ ] Collaborative editing
- [ ] Voice commands
- [ ] Mobile companion app
- [ ] 3D visualizations
- [ ] Git integration
- [ ] Docker support

## Contributing

We welcome contributions! Please see our contributing guidelines for details.

## License

MIT License - see LICENSE file for details.

---

Built with ❤️ by the Revolutionary UI team