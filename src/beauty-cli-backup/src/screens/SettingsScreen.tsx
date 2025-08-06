import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import { Panel } from '../components/Panel.js';
import TextInput from 'ink-text-input';
import { Select } from '@inkjs/ui';
import figures from 'figures';

interface SettingsScreenProps {
  onBack: () => void;
}

type SettingField = 'username' | 'theme' | 'language' | null;

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const [activeField, setActiveField] = useState<SettingField>(null);
  const [username, setUsername] = useState('User');
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('en');

  useInput((input, key) => {
    if (key.escape && !activeField) {
      onBack();
    } else if (key.escape && activeField) {
      setActiveField(null);
    } else if (key.tab && !activeField) {
      // Cycle through fields
      if (activeField === null) setActiveField('username');
      else if (activeField === 'username') setActiveField('theme');
      else if (activeField === 'theme') setActiveField('language');
      else setActiveField('username');
    }
  });

  const themes = [
    { label: 'Dark Mode', value: 'dark' },
    { label: 'Light Mode', value: 'light' },
    { label: 'High Contrast', value: 'contrast' }
  ];

  const languages = [
    { label: 'English', value: 'en' },
    { label: 'Spanish', value: 'es' },
    { label: 'French', value: 'fr' },
    { label: 'German', value: 'de' }
  ];

  return (
    <Box flexDirection="column">
      <Header 
        title="Settings" 
        subtitle="Configure your preferences"
      />
      
      <Panel title="Profile Settings" color="cyan">
        <Box flexDirection="column" gap={1}>
          <Box>
            <Box width={15}>
              <Text>Username: </Text>
            </Box>
            {activeField === 'username' ? (
              <TextInput 
                value={username} 
                onChange={setUsername}
                onSubmit={() => setActiveField(null)}
              />
            ) : (
              <Text color="yellow">{username}</Text>
            )}
          </Box>
          
          <Box>
            <Box width={15}>
              <Text>Email: </Text>
            </Box>
            <Text color="gray">user@example.com</Text>
          </Box>
        </Box>
      </Panel>

      <Panel title="Appearance" color="magenta">
        <Box flexDirection="column" gap={1}>
          <Box>
            <Box width={15}>
              <Text>Theme: </Text>
            </Box>
            {activeField === 'theme' ? (
              <Select
                options={themes}
                defaultValue={theme}
                onChange={(value) => {
                  setTheme(value);
                  setActiveField(null);
                }}
              />
            ) : (
              <Text color="yellow">{themes.find(t => t.value === theme)?.label}</Text>
            )}
          </Box>
          
          <Box>
            <Box width={15}>
              <Text>Font Size: </Text>
            </Box>
            <Text color="gray">Medium</Text>
          </Box>
        </Box>
      </Panel>

      <Panel title="Localization" color="green">
        <Box flexDirection="column" gap={1}>
          <Box>
            <Box width={15}>
              <Text>Language: </Text>
            </Box>
            {activeField === 'language' ? (
              <Select
                options={languages}
                defaultValue={language}
                onChange={(value) => {
                  setLanguage(value);
                  setActiveField(null);
                }}
              />
            ) : (
              <Text color="yellow">{languages.find(l => l.value === language)?.label}</Text>
            )}
          </Box>
          
          <Box>
            <Box width={15}>
              <Text>Timezone: </Text>
            </Box>
            <Text color="gray">UTC-5 (EST)</Text>
          </Box>
        </Box>
      </Panel>

      <Box marginTop={1}>
        <Text color="gray">{figures.info} Press TAB to edit fields</Text>
      </Box>
      
      <Footer showHelp={true} />
    </Box>
  );
};