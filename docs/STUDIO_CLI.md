# Revolutionary UI Studio CLI

## Overview

The Revolutionary UI Studio CLI provides a visual, interactive experience for component creation and management. It features a rich terminal interface with colorful gradients, ASCII art, and intuitive navigation.

## Features

### 🏗️ Component Builder
Interactive component creation with:
- Step-by-step prop configuration
- Feature selection (animations, dark mode, accessibility)
- Live code preview in terminal
- TypeScript support

### 🖼️ Component Gallery
Browse 10,000+ components with:
- Grid, list, and category views
- Featured and trending components
- Semantic search integration
- Component details and installation

### 🎨 Design System Manager
Complete design system tools:
- Create design systems from scratch
- Import from Figma (coming soon)
- Generate design tokens
- Audit consistency
- Export to multiple formats

### 🤖 AI Workshop
AI-powered component generation:
- Natural language descriptions
- Multiple framework support
- Style variations
- Code optimization

### 📊 Analytics Studio
Track your productivity:
- Components generated
- Code lines saved
- Time saved metrics
- Usage patterns

### 🔍 Smart Search
Find components intelligently:
- Semantic search (AI-powered)
- Keyword search
- Tag-based filtering
- Package search

## Installation

The Studio CLI is included with Revolutionary UI v3.4+. No additional installation needed.

## Usage

### Launch Studio
```bash
revolutionary-ui studio
# or
rui studio
```

### Quick Commands
```bash
# Jump directly to component builder
revolutionary-ui studio build

# Open component gallery
revolutionary-ui studio gallery

# Manage design system
revolutionary-ui studio design
```

## Interface

### Main Menu
The Studio presents a visual menu with these options:
- 🏗️ Component Builder - Interactive component creation
- 🖼️ Component Gallery - Browse 10K+ components
- 🎨 Design System - Manage design tokens & themes
- 🤖 AI Workshop - Generate with natural language
- 📊 Analytics Studio - View metrics & insights
- 🔍 Smart Search - Find components semantically
- 🚀 Quick Generate - Fast component creation
- ⚙️ Settings - Configure preferences

### Visual Elements

#### ASCII Art Banner
```
██╗   ██╗██╗    ███████╗████████╗██╗   ██╗██████╗ ██╗ ██████╗ 
██║   ██║██║    ██╔════╝╚══██╔══╝██║   ██║██╔══██╗██║██╔═══██╗
██║   ██║██║    ███████╗   ██║   ██║   ██║██║  ██║██║██║   ██║
██║   ██║██║    ╚════██║   ██║   ██║   ██║██║  ██║██║██║   ██║
╚██████╔╝██║    ███████║   ██║   ╚██████╔╝██████╔╝██║╚██████╔╝
 ╚═════╝ ╚═╝    ╚══════╝   ╚═╝    ╚═════╝ ╚═════╝ ╚═╝ ╚═════╝ 
```

#### Color Themes
- Primary: Gradient from pink to purple to blue
- Secondary: Gradient from green to cyan
- Accent: Gradient from orange to pink
- Success: Green
- Warning: Yellow
- Error: Red

### Component Preview
Components are displayed in styled boxes with syntax highlighting:
```
┌─ 📦 React Component Preview ─────────────┐
│                                          │
│ import React from 'react';               │
│                                          │
│ export const MyComponent = () => {       │
│   return <div>Hello World</div>;         │
│ };                                       │
│                                          │
└──────────────────────────────────────────┘
```

## Component Builder Workflow

1. **Name Your Component**
   - Must be PascalCase
   - Validated in real-time

2. **Select Component Type**
   - Basic Component
   - Form Component
   - Data Display
   - Layout Component
   - Interactive Widget
   - Mobile Component
   - Game UI Element

3. **Configure Props**
   - Add props one by one
   - Select type (string, number, boolean, etc.)
   - Mark as required or optional
   - See live prop interface

4. **Choose Features**
   - Styled with CSS-in-JS
   - Responsive design
   - Accessibility (ARIA)
   - Animations
   - Dark mode support
   - Unit tests
   - Storybook story
   - Documentation
   - State management
   - Custom hooks

5. **Preview & Save**
   - See generated code
   - Save to project
   - Regenerate with AI
   - Export to files
   - Open in visual editor

## Design System Features

### Token Generation
Generate design tokens in multiple formats:
- CSS Variables
- JavaScript/TypeScript
- JSON
- Sass Variables
- Tailwind Config

### Consistency Audit
Automated analysis of:
- Color usage (92% score)
- Typography (88% score)
- Spacing (95% score)
- Component naming (79% score)
- Accessibility (85% score)

### Color Palette
Automatic palette generation from base color:
```
██ primary: #3A86FF
██ secondary: #06FFA5
██ accent: #FFB700
██ success: #10B981
██ warning: #F59E0B
██ error: #EF4444
██ neutral: #6B7280
```

## Analytics Dashboard

View your productivity metrics:
```
┌─────────────────┬───────┬───────┐
│ Metric          │ Value │ Trend │
├─────────────────┼───────┼───────┤
│ Components Made │ 156   │ 📈 +23%│
│ Lines Saved     │ 12420 │ 📈 +45%│
│ Time Saved      │ 48.5h │ 📈 +67%│
│ AI Queries      │ 89    │ 📊 Active│
│ Catalog Search  │ 234   │ 🔍 Daily│
└─────────────────┴───────┴───────┘
```

## Configuration

Settings are stored in `~/.revolutionary-ui/studio-settings.json`:
- Theme preferences
- Default frameworks
- Project paths
- AI settings

## Tips

1. **Use ESC to Go Back** - Navigate backwards in menus
2. **Tab for Autocomplete** - In input fields
3. **Arrow Keys** - Navigate lists
4. **Enter to Confirm** - Submit selections
5. **Ctrl+C to Exit** - Exit at any time

## Integration

The Studio CLI integrates with:
- Revolutionary UI component catalog
- AI providers (OpenAI, Anthropic, Google, Mistral)
- Algolia search
- Upstash Vector for semantic search
- PostgreSQL database
- R2 storage for components

## Future Features

- [ ] Figma import/export
- [ ] Live collaboration
- [ ] Component marketplace integration
- [ ] Visual drag-and-drop builder
- [ ] Real-time preview server
- [ ] Theme marketplace
- [ ] Plugin system

## Troubleshooting

### Terminal Colors Not Showing
Ensure your terminal supports 256 colors:
```bash
echo $TERM  # Should show xterm-256color or similar
```

### ASCII Art Not Rendering
Install a monospace font that supports box-drawing characters.

### Performance Issues
The Studio CLI requires Node.js 18+ for optimal performance.

## Feedback

Found a bug or have a suggestion? Open an issue on GitHub:
https://github.com/revolutionary-ui/factory/issues