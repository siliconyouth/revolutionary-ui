# RevUI - Multi-Window Terminal UI System

## 🎯 Overview

RevUI now features a sophisticated multi-window terminal interface with a persistent sidebar menu that's always visible. This provides a desktop-like experience in the terminal.

## 🖼️ Layout Structure

```
┌─────────────────┬──────────────────────────────────────────┐
│  REVUI          │  AI Component Generator                  │
│  ─────────────  │  Generate production-ready components    │
│                 │                                          │
│  MENU           │  ┌────────────────────────────────────┐ │
│  ▶ 🎮 Generate  │  │  Select Component Type            │ │
│    🔍 Analyze   │  │  • Form - Dynamic forms           │ │
│    ⭐ Search    │  │  • Table - Data tables            │ │
│    ▪ Factories  │  │  • Dashboard - Admin dashboards   │ │
│    ▪ Dashboard  │  │  • Chart - Data visualization     │ │
│    ❤ AI Chat    │  │  • ...                            │ │
│    ↑ Sync       │  └────────────────────────────────────┘ │
│    ☰ Templates  │                                          │
│    ◆ Docs       │  [ℹ Use sidebar navigation • ESC focus] │
│    ☰ Settings   │                                          │
│    ℹ About      │                                          │
│                 │                                          │
│  ─────────────  │                                          │
│  SHORTCUTS      │                                          │
│  ↑↓ Navigate    │                                          │
│  Enter Select   │                                          │
│  ESC Back       │                                          │
│  Ctrl+C Exit    │                                          │
└─────────────────┴──────────────────────────────────────────┘
```

## 🚀 Features

### 1. **Persistent Sidebar**
- Always visible menu on the left
- Shows current selection with `▶` pointer
- Active screen highlighted in cyan
- Navigation shortcuts at bottom
- Badges for special features (AI, HOT, etc.)

### 2. **Main Content Area**
- Full screen content on the right
- Headers are simplified (no borders)
- Clean, focused interface
- Responsive to terminal size

### 3. **Smart Navigation**
- **↑/↓ Arrow Keys**: Navigate menu items
- **Enter**: Select menu item
- **ESC**: Focus back to sidebar (never exits)
- **Ctrl+C**: Exit application

### 4. **Visual Indicators**
- **Yellow**: Currently selected menu item
- **Cyan**: Active screen
- **Gray**: Inactive items
- **Badges**: Feature indicators (AI, SMART, 10K+, etc.)

## 🔧 Technical Implementation

### Components

1. **MultiWindowLayout**
   - Manages sidebar and main content layout
   - Handles responsive sizing
   - Provides border between sections

2. **Sidebar**
   - Displays menu items
   - Shows shortcuts
   - Indicates current selection
   - Logo at top

3. **Updated App Component**
   - Global navigation handling
   - No more per-screen ESC handling
   - Consistent state management

### Key Changes

1. **ESC Key Behavior**
   - No longer exits the application
   - Used for navigation within screens
   - Ctrl+C is the only way to exit

2. **Removed MainMenu Screen**
   - Menu is now always visible in sidebar
   - Direct navigation to first option (Generate)

3. **Simplified Headers**
   - Removed gradient borders
   - Clean, minimal design
   - Better space utilization

## 📋 Benefits

1. **Always Visible Navigation**
   - Users always know where they are
   - Can see all available options
   - Quick switching between features

2. **Desktop-Like Experience**
   - Familiar multi-pane interface
   - Professional appearance
   - Efficient use of screen space

3. **Improved UX**
   - No need to "go back" to menu
   - Direct navigation between any screens
   - Clear visual hierarchy

4. **Better Context**
   - Current location always visible
   - Available options always shown
   - Shortcuts reminder always present

## 🎨 Customization

The layout can be customized by adjusting:

- `sidebarWidth` in MultiWindowLayout (default: 30)
- Colors in Sidebar component
- Menu items in App component
- Border styles in MultiWindowLayout

## 🚦 Usage

```bash
# Run the multi-window UI
./run-revui.sh

# Navigation
- Use ↑/↓ to move selection
- Press Enter to open screen
- ESC to focus sidebar
- Ctrl+C to exit
```

The multi-window system transforms RevUI into a powerful, professional terminal application with excellent navigation and user experience!