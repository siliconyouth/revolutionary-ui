/**
 * Main Menu View
 */

import React, { useState, useEffect } from 'react';
import { AppContext } from '../terminal-app';

interface Props {
  context: AppContext;
}

export const MainMenu: React.FC<Props> = ({ context }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const menuItems = [
    { label: '🚀 Generate Component', action: 'generate' },
    { label: '📊 Browse Catalog', action: 'catalog' },
    { label: '⚙️  Settings', action: 'settings' },
    { label: '❌ Exit', action: 'exit' }
  ];

  useEffect(() => {
    const handleKey = (ch: string, key: any) => {
      if (!key) return;
      
      if (key.name === 'up' || key.name === 'k') {
        setSelectedIndex(prev => Math.max(0, prev - 1));
      } else if (key.name === 'down' || key.name === 'j') {
        setSelectedIndex(prev => Math.min(menuItems.length - 1, prev + 1));
      } else if (key.name === 'return' || key.name === 'enter') {
        const item = menuItems[selectedIndex];
        context.navigate(item.action as any);
      }
    };

    context.screen.on('keypress', handleKey);
    return () => {
      context.screen.off('keypress', handleKey);
    };
  }, [selectedIndex, context]);

  return (
    <>
      {/* Menu List */}
      <list
        top={4}
        left={0}
        width="50%"
        height="70%"
        border={{ type: 'line' }}
        style={{
          border: { fg: 'cyan' },
          selected: { bg: 'blue', fg: 'white' }
        }}
        label=" Main Menu "
        items={menuItems.map(item => item.label)}
        selected={selectedIndex}
        interactive={true}
        keys={true}
        mouse={true}
      />

      {/* Activity Log */}
      <box
        top={4}
        left="50%"
        width="50%"
        height="70%"
        border={{ type: 'line' }}
        style={{ border: { fg: 'cyan' } }}
        label=" Activity Log "
        scrollable={true}
        mouse={true}
      >
        {context.logs.join('\n')}
      </box>
    </>
  );
};