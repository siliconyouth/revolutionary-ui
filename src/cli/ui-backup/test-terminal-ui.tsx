#!/usr/bin/env tsx

/**
 * Simple test for Terminal UI with react-blessed
 */

import React from 'react';
import blessed from 'blessed';
import { render } from 'react-blessed';

// Simple component
const App = () => {
  return (
    <>
      <box
        label=" Revolutionary UI Test "
        content="{center}Testing Terminal UI{/center}"
        border={{ type: 'line' }}
        style={{
          border: { fg: 'cyan' },
          label: { fg: 'magenta' }
        }}
        top={0}
        left={0}
        width="100%"
        height={5}
      />
      
      <list
        label=" Menu "
        items={['Option 1', 'Option 2', 'Option 3', 'Exit']}
        border={{ type: 'line' }}
        style={{
          selected: { bg: 'blue' },
          border: { fg: 'cyan' }
        }}
        keys={true}
        mouse={true}
        top={5}
        left={0}
        width="50%"
        height={10}
        onSelect={(item: any, index: number) => {
          if (index === 3) {
            process.exit(0);
          }
        }}
      />
      
      <log
        label=" Logs "
        border={{ type: 'line' }}
        style={{
          border: { fg: 'cyan' }
        }}
        top={5}
        left="50%"
        width="50%"
        height={10}
      />
    </>
  );
};

// Create screen
const screen = blessed.screen({
  smartCSR: true,
  title: 'Terminal UI Test'
});

// Setup key bindings
screen.key(['escape', 'q', 'C-c'], () => {
  return process.exit(0);
});

// Render the app
const component = render(<App />, screen);

// Initial render
screen.render();

console.log('Terminal UI test started. Press ESC or q to exit.');