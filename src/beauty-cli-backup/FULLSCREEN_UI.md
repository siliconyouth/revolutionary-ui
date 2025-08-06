# RevUI - Full Screen Terminal UI

## Features Implemented

### 🖥️ Full Screen UI
- **Screen Clearing**: Automatically clears the terminal on startup
- **Dynamic Sizing**: Adapts to terminal dimensions using `useTerminalSize` hook
- **Cursor Hiding**: Hides the cursor for a cleaner interface
- **Full Height Layouts**: All screens use 100% height for immersive experience
- **Responsive**: Handles terminal resize events

### 🎨 Visual Enhancements
- **No Border**: Clean edge-to-edge interface
- **Consistent Padding**: All screens have `paddingX={2} paddingY={1}`
- **Full Screen Container**: `<FullScreen>` wrapper component
- **Welcome Screen**: Centered content with rainbow gradients

### 📐 Layout Structure
```
┌─────────────────────────────────────┐
│  Revolutionary UI CLI               │ <- Header with gradient
│  AI-Powered Component Generation    │
├─────────────────────────────────────┤
│                                     │
│     Main Content Area               │ <- Full height content
│     (Menus, Forms, Panels)          │
│                                     │
├─────────────────────────────────────┤
│  ↑↓ Navigate • Enter Select • ESC  │ <- Footer with help
└─────────────────────────────────────┘
```

## Running the Full Screen UI

```bash
# Standard run (with clear screen)
./test-fullscreen.sh

# Or directly
./run-revui.sh

# With specific commands
./test-fullscreen.sh generate
./test-fullscreen.sh analyze
./test-fullscreen.sh search "table"
```

## Technical Implementation

### 1. **Screen Clearing**
```typescript
// In cli.tsx
console.clear();
```

### 2. **Terminal Size Hook**
```typescript
export const useTerminalSize = () => {
  const [size, setSize] = useState({
    columns: process.stdout.columns || 80,
    rows: process.stdout.rows || 24
  });
  
  // Handles resize events
  process.stdout.on('resize', handleResize);
};
```

### 3. **FullScreen Component**
```typescript
<Box
  width={columns}
  height={rows}
  flexDirection="column"
>
  {children}
</Box>
```

### 4. **Cursor Management**
```typescript
// Hide cursor
process.stdout.write('\x1B[?25l');

// Show cursor on exit
process.stdout.write('\x1B[?25h');
```

## Benefits

1. **Immersive Experience**: Feels like a dedicated application
2. **Professional Look**: Clean, modern interface
3. **Better Space Usage**: Utilizes entire terminal
4. **Focus**: No distractions from other terminal content
5. **Consistency**: Uniform experience across all screens

## Keyboard Navigation

- **↑/↓**: Navigate menus
- **Enter**: Select option
- **ESC**: Go back / Exit
- **Tab**: Switch between fields
- **Ctrl+C**: Force exit

The full screen UI transforms the CLI into a professional, desktop-like application experience!