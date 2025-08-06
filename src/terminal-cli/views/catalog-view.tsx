/**
 * Catalog Browser View
 */

import React, { useState, useEffect } from 'react';
import { AppContext } from '../terminal-app';

interface Props {
  context: AppContext;
}

export const CatalogView: React.FC<Props> = ({ context }) => {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [selectedComponent, setSelectedComponent] = useState(0);
  
  const categories = [
    'All Components',
    'Forms & Inputs',
    'Tables & Data',
    'Navigation',
    'Charts',
    'Modals'
  ];

  const components = [
    { name: 'LoginForm', framework: 'React', category: 'Forms' },
    { name: 'DataTable', framework: 'Vue', category: 'Tables' },
    { name: 'NavBar', framework: 'React', category: 'Navigation' },
    { name: 'LineChart', framework: 'Angular', category: 'Charts' }
  ];

  useEffect(() => {
    const handleKey = (ch: string, key: any) => {
      if (!key) return;
      
      if (key.name === 'escape') {
        context.navigate('main');
      }
    };

    context.screen.on('keypress', handleKey);
    return () => {
      context.screen.off('keypress', handleKey);
    };
  }, [context]);

  return (
    <>
      {/* Categories */}
      <list
        top={4}
        left={0}
        width="25%"
        height="70%"
        border={{ type: 'line' }}
        style={{
          border: { fg: 'cyan' },
          selected: { bg: 'blue', fg: 'white' }
        }}
        label=" Categories "
        items={categories}
        selected={selectedCategory}
        interactive={true}
        keys={true}
      />

      {/* Components List */}
      <list
        top={4}
        left="25%"
        width="35%"
        height="70%"
        border={{ type: 'line' }}
        style={{
          border: { fg: 'cyan' },
          selected: { bg: 'blue', fg: 'white' }
        }}
        label=" Components "
        items={components.map(c => `${c.name} (${c.framework})`)}
        selected={selectedComponent}
        interactive={true}
        keys={true}
      />

      {/* Component Details */}
      <box
        top={4}
        left="60%"
        width="40%"
        height="70%"
        border={{ type: 'line' }}
        style={{ border: { fg: 'cyan' } }}
        label=" Details "
      >
        {selectedComponent < components.length && `
Name: ${components[selectedComponent].name}
Framework: ${components[selectedComponent].framework}
Category: ${components[selectedComponent].category}

Press Enter to use this component
        `}
      </box>
    </>
  );
};