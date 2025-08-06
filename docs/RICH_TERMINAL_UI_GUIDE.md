# Rich Terminal UI Guide

Revolutionary UI now includes multiple advanced Terminal UI options with rich widgets, charts, and emoji support.

## Available Terminal UIs

### 1. Rich Terminal UI (`npm run ui:rich`)
The most feature-rich Terminal UI with:
- **Real-time charts**: Line charts, bar charts, gauges, sparklines
- **Interactive widgets**: Tables, forms, progress bars
- **Smart emoji support**: Auto-detects terminal capabilities
- **Activity monitoring**: Live logs and transaction tracking
- **Grid layout**: 12x12 responsive grid system

**Features:**
- blessed-contrib integration for advanced widgets
- node-emoji for cross-platform emoji support
- Real-time data updates
- Keyboard shortcuts for quick navigation

### 2. Advanced Dashboard (`npm run ui:dashboard`)
Professional monitoring dashboard with:
- **Performance metrics**: Real-time performance monitoring
- **Multi-line charts**: Framework comparison graphs
- **World map**: Global usage visualization
- **Donut charts**: Component type distribution
- **LCD displays**: Key metrics in retro style
- **Transaction logs**: Real-time activity tracking

### 3. Full Terminal UI (`npm run ui:full`)
Complete implementation with all features:
- Component generation workflow
- Browse catalog with search
- AI assistant integration
- Settings management
- Analytics dashboard
- ASCII fallback for compatibility

### 4. Basic Terminal UI (`npm run ui:basic`)
Minimal, compatible version for:
- Older terminals
- SSH sessions
- Limited environments
- Maximum compatibility

## Quick Start

### Using the Launcher
```bash
npm run ui:launcher
# or
./launch-terminal-ui.sh
```

### Direct Commands
```bash
# Rich UI with emojis
npm run ui:rich

# Professional dashboard
npm run ui:dashboard

# Full-featured UI
npm run ui:full

# Basic compatible UI
npm run ui:basic
```

### CLI Options
```bash
# Specify UI type
npx revolutionary-ui ui --ui=rich
npx revolutionary-ui ui --ui=dashboard
npx revolutionary-ui ui --ui=full

# Enable emoji support
npx revolutionary-ui ui --ui=rich --emoji

# Set theme
npx revolutionary-ui ui --ui=rich --theme=cyan
```

## Terminal Requirements

### For Rich UIs (rich, dashboard)
- **Terminal**: Modern terminal with 256 color support
- **Font**: Unicode font with emoji support (recommended: Nerd Fonts)
- **Size**: Minimum 80x24, recommended 120x40
- **Examples**: iTerm2, Windows Terminal, VS Code Terminal

### For Basic UIs (full, basic)
- **Terminal**: Any terminal with basic ANSI support
- **Font**: Any monospace font
- **Size**: Minimum 80x24
- **Examples**: PuTTY, basic SSH clients

## Keyboard Shortcuts

### Universal Shortcuts
- `q` or `Ctrl+C`: Quit
- `ESC`: Back to previous view
- `?` or `h`: Show help

### Navigation
- `↑/↓` or `j/k`: Navigate up/down
- `←/→` or `h/l`: Navigate left/right
- `Tab`: Next field/widget
- `Shift+Tab`: Previous field/widget
- `Enter`: Select/Confirm

### Quick Access
- `d`: Dashboard view
- `g`: Generate component
- `c`: Browse catalog
- `a`: Analytics
- `s`: Settings

### Rich UI Specific
- `r`: Refresh data
- `1-9`: Select widget directly
- `Space`: Toggle/activate

## Widget Types

### Charts
- **Line Chart**: Time-series data, trends
- **Bar Chart**: Comparisons, distributions
- **Gauge**: Percentage metrics
- **Sparkline**: Compact activity indicators
- **Donut**: Proportional data

### Data Display
- **Table**: Structured data with sorting
- **Log**: Real-time activity feed
- **LCD**: Numeric displays
- **Map**: Geographic visualization

### Input
- **Text Input**: Component names, search
- **Select**: Framework selection
- **Checkbox**: Feature toggles
- **Radio**: Exclusive options

## Troubleshooting

### Emoji Display Issues
```bash
# Force ASCII mode
export TERMINAL_EMOJIS=false
npm run ui:rich

# Force emoji mode
export FORCE_EMOJI=true
npm run ui:rich
```

### Performance Issues
```bash
# Disable animations
npx revolutionary-ui ui --ui=rich --animations=false

# Use basic UI
npm run ui:basic
```

### Color Issues
```bash
# Force color mode
export FORCE_COLOR=1

# Set specific terminal
export TERM=xterm-256color
```

## Environment Variables

| Variable | Description | Values |
|----------|-------------|---------|
| `TERM` | Terminal type | xterm, xterm-256color |
| `TERMINAL_EMOJIS` | Enable emojis | true/false |
| `FORCE_EMOJI` | Force emoji display | true/false |
| `FORCE_COLOR` | Force color output | 0/1/2/3 |
| `NO_COLOR` | Disable colors | any value |

## Best Practices

1. **Choose the right UI**: 
   - Rich UI for modern terminals
   - Dashboard for monitoring
   - Full UI for complete features
   - Basic UI for compatibility

2. **Terminal setup**:
   - Use a modern terminal emulator
   - Install a font with emoji support
   - Set adequate terminal size
   - Enable 256 color support

3. **Performance**:
   - Close unnecessary widgets
   - Disable animations if slow
   - Use wired connection for SSH

4. **Accessibility**:
   - Use high contrast themes
   - Enable screen reader mode
   - Use keyboard navigation

## Advanced Configuration

### Custom Themes
Create `.revolutionary-ui/themes/custom.json`:
```json
{
  "name": "custom",
  "colors": {
    "primary": "cyan",
    "secondary": "magenta",
    "success": "green",
    "warning": "yellow",
    "error": "red",
    "info": "blue"
  }
}
```

### Widget Configuration
Create `.revolutionary-ui/widgets.json`:
```json
{
  "dashboard": {
    "layout": "grid",
    "refresh": 2000,
    "widgets": [
      { "type": "line", "row": 0, "col": 0, "rowSpan": 4, "colSpan": 6 },
      { "type": "gauge", "row": 0, "col": 6, "rowSpan": 2, "colSpan": 3 }
    ]
  }
}
```

## Development

### Creating Custom Widgets
```javascript
const CustomWidget = ({ data }) => {
  return React.createElement(contrib.line, {
    label: 'Custom Metric',
    data: data,
    style: { line: 'cyan' }
  });
};
```

### Adding New UI Modes
1. Create new UI file in `src/cli/ui/`
2. Add to terminal-ui.ts command
3. Add npm script to package.json
4. Update documentation

## Upcoming Features

- [ ] Plugin system for custom widgets
- [ ] Theme marketplace
- [ ] Remote monitoring mode
- [ ] Mobile terminal support
- [ ] Voice commands
- [ ] AI-powered insights
- [ ] Export to various formats
- [ ] Collaborative sessions

## Resources

- [blessed Documentation](https://github.com/chjj/blessed)
- [blessed-contrib Widgets](https://github.com/yaronn/blessed-contrib)
- [react-blessed Guide](https://github.com/Yomguithereal/react-blessed)
- [Terminal Fonts](https://www.nerdfonts.com/)
- [Revolutionary UI Docs](https://revolutionary-ui.com/docs)