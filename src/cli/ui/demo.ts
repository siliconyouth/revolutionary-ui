#!/usr/bin/env node

/**
 * Demo application for the new Terminal UI system
 */

import { TerminalApp } from './app/App.js';
import { Box } from './components/base/Box.js';
import { Text } from './components/base/Text.js';
import { Input } from './components/base/Input.js';

// Create main application
const app = new TerminalApp({
  title: 'Revolutionary UI Terminal Demo',
  fps: 30
});

// Create main container
const mainBox = new Box({
  title: 'Revolutionary UI v3.3.0',
  titleAlign: 'center',
  style: {
    border: true,
    borderStyle: {
      fg: 'cyan'
    }
  },
  padding: {
    top: 1,
    right: 2,
    bottom: 1,
    left: 2
  }
});

// Create header text
const headerText = new Text({
  content: 'Welcome to the Revolutionary UI Terminal Interface!\n\nThis is a lightweight, dependency-free terminal UI system.',
  align: 'center',
  style: {
    fg: 'green',
    bold: true
  }
});

// Create input field
const nameInput = new Input({
  placeholder: 'Enter your name...',
  style: {
    fg: 'white',
    bg: 'blue'
  }
});

// Create info box
const infoBox = new Box({
  title: 'Instructions',
  style: {
    border: true,
    borderStyle: {
      fg: 'yellow'
    }
  }
});

const infoText = new Text({
  content: 'Navigation:\n- Tab/Shift+Tab: Focus navigation\n- Arrow keys: Move cursor in input\n- Ctrl+Q: Quit application\n\nThis is Phase 1 of our new terminal UI implementation.',
  wrap: true,
  style: {
    fg: 'yellow'
  }
});

// Add components to info box
infoBox.addChild(infoText);

// Create a simple layout manager
class SimpleLayout extends Box {
  layout(): void {
    const content = this.getContentBounds();
    const children = this.getChildren();
    
    if (children.length === 0) return;
    
    // Calculate heights
    const headerHeight = 3;
    const inputHeight = 1;
    const spacing = 1;
    const remainingHeight = content.height - headerHeight - inputHeight - (spacing * 2);
    
    let currentY = 0;
    
    // Position header
    if (children[0]) {
      children[0].setBounds(
        content.x,
        content.y + currentY,
        content.width,
        headerHeight
      );
      children[0].layout();
      currentY += headerHeight + spacing;
    }
    
    // Position input
    if (children[1]) {
      children[1].setBounds(
        content.x,
        content.y + currentY,
        content.width,
        inputHeight
      );
      children[1].layout();
      currentY += inputHeight + spacing;
    }
    
    // Position info box
    if (children[2]) {
      children[2].setBounds(
        content.x,
        content.y + currentY,
        content.width,
        Math.max(1, remainingHeight)
      );
      children[2].layout();
    }
  }
}

// Create layout container
const layoutContainer = new SimpleLayout({
  style: {
    border: false
  }
});

// Build component tree
layoutContainer.addChild(headerText);
layoutContainer.addChild(nameInput);
layoutContainer.addChild(infoBox);
mainBox.addChild(layoutContainer);

// Add main view
app.addView('main', mainBox);

// Handle input changes
nameInput.on('valueChange', (value: string) => {
  if (value) {
    headerText.setContent(`Welcome to the Revolutionary UI Terminal Interface!\n\nHello, ${value}!`);
  } else {
    headerText.setContent('Welcome to the Revolutionary UI Terminal Interface!\n\nThis is a lightweight, dependency-free terminal UI system.');
  }
  app.getRenderer().forceRender();
});

// Handle app events
app.on('start', () => {
  // App started successfully
});

app.on('exit', (code) => {
  // Cleanup before exit
});

app.on('keypress', (key) => {
  // Additional global key handling
  if (key.name === 'r' && key.ctrl) {
    // Force re-render
    app.getRenderer().forceRender();
  }
});

// Run the application
app.run();