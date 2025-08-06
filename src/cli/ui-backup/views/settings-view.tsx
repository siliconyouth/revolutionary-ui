/**
 * Settings Manager View for Terminal UI
 */

import React, { useState, useEffect } from 'react';
import { DatabaseResourceService } from '../../../services/database-resource-service.js';

interface SettingsViewProps {
  dbService: DatabaseResourceService;
  onBack: () => void;
  addLog: (message: string) => void;
}

interface SettingsSection {
  title: string;
  items: SettingItem[];
}

interface SettingItem {
  label: string;
  value: string | boolean | number;
  type: 'text' | 'boolean' | 'select' | 'number';
  options?: string[];
}

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  dbService, 
  onBack, 
  addLog 
}) => {
  const [sections] = useState<SettingsSection[]>([
    {
      title: 'General Settings',
      items: [
        { label: 'Default Framework', value: 'react', type: 'select', options: ['react', 'vue', 'angular', 'svelte'] },
        { label: 'TypeScript', value: true, type: 'boolean' },
        { label: 'Auto-save', value: true, type: 'boolean' },
        { label: 'Theme', value: 'dark', type: 'select', options: ['dark', 'light', 'auto'] }
      ]
    },
    {
      title: 'AI Configuration',
      items: [
        { label: 'Default Provider', value: 'openai', type: 'select', options: ['openai', 'anthropic', 'google', 'mistral'] },
        { label: 'Stream Responses', value: true, type: 'boolean' },
        { label: 'Max Tokens', value: 2000, type: 'number' },
        { label: 'Temperature', value: 0.7, type: 'number' }
      ]
    },
    {
      title: 'Project Settings',
      items: [
        { label: 'Output Directory', value: './generated', type: 'text' },
        { label: 'Component Prefix', value: '', type: 'text' },
        { label: 'Include Tests', value: true, type: 'boolean' },
        { label: 'Include Documentation', value: true, type: 'boolean' }
      ]
    }
  ]);
  
  const [selectedSection, setSelectedSection] = useState(0);
  const [selectedItem, setSelectedItem] = useState(0);
  const [focusedPanel, setFocusedPanel] = useState<'sections' | 'items'>('sections');

  useEffect(() => {
    addLog('Settings loaded');
  }, []);

  const handleSectionSelect = (index: number) => {
    setSelectedSection(index);
    setSelectedItem(0);
    addLog(`Selected: ${sections[index].title}`);
  };

  const handleItemSelect = (index: number) => {
    setSelectedItem(index);
    const item = sections[selectedSection].items[index];
    addLog(`Selected setting: ${item.label}`);
  };

  const currentSection = sections[selectedSection];

  return (
    <>
      {/* Settings Sections */}
      <box
        top={4}
        left={0}
        width="30%"
        height="70%"
        border={{ type: 'line' }}
        style={{
          border: { fg: focusedPanel === 'sections' ? 'green' : 'cyan' },
          label: { fg: 'magenta' }
        }}
        label=" Settings Categories "
      >
        <list
          items={sections.map((section, i) => 
            i === selectedSection ? `> ${section.title}` : `  ${section.title}`
          )}
          style={{
            selected: { bg: 'blue', fg: 'white' }
          }}
        />
      </box>

      {/* Settings Items */}
      <box
        top={4}
        left="30%"
        width="40%"
        height="70%"
        border={{ type: 'line' }}
        style={{
          border: { fg: focusedPanel === 'items' ? 'green' : 'cyan' },
          label: { fg: 'magenta' }
        }}
        label={` ${currentSection.title} `}
      >
        <list
          items={currentSection.items.map((item, i) => {
            const prefix = i === selectedItem ? '> ' : '  ';
            const value = item.type === 'boolean' ? (item.value ? '✓' : '✗') : item.value;
            return `${prefix}${item.label}: ${value}`;
          })}
          style={{
            selected: { bg: 'blue', fg: 'white' }
          }}
        />
      </box>

      {/* Setting Details */}
      <box
        top={4}
        left="70%"
        width="30%"
        height="70%"
        border={{ type: 'line' }}
        style={{
          border: { fg: 'cyan' },
          label: { fg: 'magenta' }
        }}
        label=" Setting Details "
        content={currentSection.items[selectedItem] ? `
{bold}${currentSection.items[selectedItem].label}{/bold}
{gray-fg}━━━━━━━━━━━━━━━━━━━━━━━━━━━━{/gray-fg}

{cyan-fg}Type:{/cyan-fg} ${currentSection.items[selectedItem].type}
{cyan-fg}Current Value:{/cyan-fg} ${currentSection.items[selectedItem].value}

${currentSection.items[selectedItem].options ? 
`{yellow-fg}Options:{/yellow-fg}
${currentSection.items[selectedItem].options!.map(opt => `  • ${opt}`).join('\\n')}` : ''}

{gray-fg}━━━━━━━━━━━━━━━━━━━━━━━━━━━━{/gray-fg}
{green-fg}Press Enter to edit{/green-fg}
        ` : 'Select a setting to view details'}
        tags={true}
        scrollable={true}
      />

      {/* Instructions */}
      <box
        bottom={3}
        left={0}
        width="100%"
        height={3}
        border={{ type: 'line' }}
        style={{
          border: { fg: 'cyan' }
        }}
        content="{center}Tab: Switch Panel | ↑↓: Navigate | Enter: Edit | ESC: Back to Menu{/center}"
        tags={true}
      />
    </>
  );
};