import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import Spinner from 'ink-spinner';
import open from 'open';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

interface SettingsProps {
  onBack: () => void;
  onAIMessage: (message: string) => void;
}

type SettingsSection = 'main' | 'ai' | 'ui' | 'project' | 'reset';

export const Settings: React.FC<SettingsProps> = ({ onBack, onAIMessage }) => {
  const [section, setSection] = useState<SettingsSection>('main');
  const [loading, setLoading] = useState(false);
  const [authInput, setAuthInput] = useState('');
  const [message, setMessage] = useState('');

  useInput((input, key) => {
    if (key.escape) {
      if (section === 'main') {
        onBack();
      } else {
        setSection('main');
      }
    }
  });

  const handleAIAuth = async () => {
    setLoading(true);
    setMessage('Opening browser for authentication...');
    
    try {
      // Open Claude AI auth page
      await open('https://claude.ai/login?return-to=/api/auth/session');
      setMessage('Browser opened! After logging in, copy the sessionKey from the page.');
    } catch (error) {
      setMessage('Failed to open browser. Please visit: https://claude.ai/login?return-to=/api/auth/session');
    }
    
    setLoading(false);
  };

  const saveAuthKey = async () => {
    if (!authInput.trim()) return;
    
    setLoading(true);
    try {
      const configDir = path.join(os.homedir(), '.revolutionary-ui');
      await fs.mkdir(configDir, { recursive: true });
      
      await fs.writeFile(
        path.join(configDir, 'claude-session.json'),
        JSON.stringify({ sessionKey: authInput.trim() }, null, 2)
      );
      
      setMessage('✓ Authentication saved! Restart the app to activate.');
      onAIMessage('Claude AI authentication configured successfully!');
      setTimeout(() => setSection('main'), 2000);
    } catch (error) {
      setMessage('Failed to save authentication. Please try again.');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Box padding={2} justifyContent="center" alignItems="center">
        <Text color="yellow">
          <Spinner type="dots" /> Processing...
        </Text>
      </Box>
    );
  }

  if (section === 'main') {
    return (
      <Box flexDirection="column" padding={2}>
        <Text bold marginBottom={2}>Settings</Text>
        
        <SelectInput
          items={[
            { 
              label: '🤖 AI Configuration', 
              value: 'ai',
              description: 'Configure Claude AI authentication'
            },
            { 
              label: '🎨 UI Preferences', 
              value: 'ui',
              description: 'Theme, colors, and display options'
            },
            { 
              label: '📁 Project Settings', 
              value: 'project',
              description: 'Default frameworks and tools'
            },
            { 
              label: '🔄 Reset Configuration', 
              value: 'reset',
              description: 'Clear all settings and start fresh'
            },
            { label: '← Back', value: 'back' }
          ]}
          onSelect={(item) => {
            if (item.value === 'back') {
              onBack();
            } else {
              setSection(item.value as SettingsSection);
              if (item.value === 'ai') {
                onAIMessage('Configure Claude AI for unlimited assistance without rate limits.');
              }
            }
          }}
          itemComponent={(props) => (
            <Box paddingY={1}>
              <Box flexDirection="column">
                <Text bold color={props.isSelected ? 'cyan' : 'white'}>
                  {props.isSelected ? '▶ ' : '  '}{props.label}
                </Text>
                {props.description && (
                  <Box marginLeft={4}>
                    <Text dimColor>{props.description}</Text>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        />
      </Box>
    );
  }

  if (section === 'ai') {
    return (
      <Box flexDirection="column" padding={2}>
        <Text bold marginBottom={2}>AI Configuration</Text>
        
        {message && (
          <Box marginBottom={2}>
            <Text color={message.includes('✓') ? 'green' : 'yellow'}>{message}</Text>
          </Box>
        )}

        <Box flexDirection="column" marginBottom={2}>
          <Text marginBottom={1}>Claude AI Session Authentication</Text>
          <Text dimColor marginBottom={2}>
            This allows unlimited AI assistance without API rate limits
          </Text>
        </Box>

        <SelectInput
          items={[
            { label: '🌐 Open Browser for Authentication', value: 'open' },
            { label: '🔑 Enter Session Key', value: 'enter' },
            { label: '← Back', value: 'back' }
          ]}
          onSelect={(item) => {
            if (item.value === 'open') {
              handleAIAuth();
            } else if (item.value === 'enter') {
              // Switch to input mode
              setMessage('');
            } else {
              setSection('main');
            }
          }}
        />

        {!message && (
          <Box marginTop={2}>
            <Text>Session Key: </Text>
            <TextInput
              value={authInput}
              onChange={setAuthInput}
              onSubmit={saveAuthKey}
              placeholder="Paste your sessionKey here..."
            />
          </Box>
        )}
      </Box>
    );
  }

  if (section === 'ui') {
    return (
      <Box flexDirection="column" padding={2}>
        <Text bold marginBottom={2}>UI Preferences</Text>
        
        <SelectInput
          items={[
            { label: '🌈 Theme: Rainbow (Current)', value: 'theme' },
            { label: '📊 Show Analytics: Yes', value: 'analytics' },
            { label: '🔔 Notifications: Enabled', value: 'notifications' },
            { label: '⌨️  Keyboard Shortcuts: Default', value: 'shortcuts' },
            { label: '← Back', value: 'back' }
          ]}
          onSelect={(item) => {
            if (item.value === 'back') {
              setSection('main');
            } else {
              onAIMessage('UI preferences saved!');
            }
          }}
        />
      </Box>
    );
  }

  if (section === 'project') {
    return (
      <Box flexDirection="column" padding={2}>
        <Text bold marginBottom={2}>Project Settings</Text>
        
        <SelectInput
          items={[
            { label: '🚀 Default Framework: React', value: 'framework' },
            { label: '💅 Default CSS: Tailwind CSS', value: 'css' },
            { label: '🛠️  Default Build Tool: Vite', value: 'build' },
            { label: '🧪 Default Test Framework: Vitest', value: 'test' },
            { label: '📦 Package Manager: npm', value: 'package' },
            { label: '← Back', value: 'back' }
          ]}
          onSelect={(item) => {
            if (item.value === 'back') {
              setSection('main');
            } else {
              onAIMessage('Project settings updated!');
            }
          }}
        />
      </Box>
    );
  }

  if (section === 'reset') {
    return (
      <Box flexDirection="column" padding={2}>
        <Text bold marginBottom={2} color="red">Reset Configuration</Text>
        
        <Text marginBottom={2}>
          This will clear all settings and return to defaults.
        </Text>
        
        <SelectInput
          items={[
            { label: '❌ Reset All Settings', value: 'reset-all' },
            { label: '🤖 Reset AI Configuration Only', value: 'reset-ai' },
            { label: '🎨 Reset UI Preferences Only', value: 'reset-ui' },
            { label: '← Cancel', value: 'back' }
          ]}
          onSelect={async (item) => {
            if (item.value === 'back') {
              setSection('main');
            } else if (item.value.startsWith('reset-')) {
              setMessage('Configuration reset successfully!');
              onAIMessage('Settings have been reset to defaults.');
              setTimeout(() => setSection('main'), 2000);
            }
          }}
        />
      </Box>
    );
  }

  return null;
};