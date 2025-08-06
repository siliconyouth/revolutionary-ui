import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import { Panel } from '../components/Panel.js';
import { Select, Spinner } from '@inkjs/ui';
import figures from 'figures';

interface DocsScreenProps {
  onBack: () => void;
}

type DocAction = 'idle' | 'generating';

export const DocsScreen: React.FC<DocsScreenProps> = ({ onBack }) => {
  const [action, setAction] = useState<DocAction>('idle');
  const [selectedType, setSelectedType] = useState('');

  useInput((input, key) => {
    if (key.escape) {
      onBack();
    }
  });

  const docTypes = [
    { label: 'API Documentation', value: 'api', description: 'Generate from code comments' },
    { label: 'Component Docs', value: 'components', description: 'Document all components' },
    { label: 'README Generator', value: 'readme', description: 'Create project README' },
    { label: 'Usage Examples', value: 'examples', description: 'Generate code examples' },
    { label: 'Architecture Docs', value: 'architecture', description: 'System design docs' }
  ];

  const handleGenerate = (type: string) => {
    setSelectedType(type);
    setAction('generating');
    
    // Simulate generation
    setTimeout(() => {
      setAction('idle');
    }, 3000);
  };

  return (
    <Box flexDirection="column">
      <Header 
        title="Documentation Generator" 
        subtitle="AI-powered documentation from your code"
      />

      <Box flexDirection="row" gap={1}>
        <Panel title="Documentation Stats" color="cyan" width={40}>
          <Box flexDirection="column" gap={1}>
            <Box>
              <Text color="cyan">Current Coverage: </Text>
              <Text color="yellow">67%</Text>
            </Box>
            <Box>
              <Text color="cyan">Documented Components: </Text>
              <Text>31/47</Text>
            </Box>
            <Box>
              <Text color="cyan">Last Generated: </Text>
              <Text>3 days ago</Text>
            </Box>
            <Box>
              <Text color="cyan">Format: </Text>
              <Text>Markdown + JSDoc</Text>
            </Box>
          </Box>
        </Panel>

        <Panel title="Missing Documentation" color="red" width={40}>
          <Box flexDirection="column" gap={1}>
            <Text color="yellow">{figures.warning} 16 components undocumented</Text>
            <Text color="yellow">{figures.warning} 8 functions missing JSDoc</Text>
            <Text color="yellow">{figures.warning} README outdated</Text>
            <Text color="green">{figures.tick} API routes documented</Text>
          </Box>
        </Panel>
      </Box>

      {action === 'idle' && (
        <Panel title="Generate Documentation" color="green">
          <Box flexDirection="column" gap={1}>
            <Text>Select documentation type:</Text>
            <Box marginTop={1}>
              <Select
                options={docTypes.map(type => ({
                  label: `${type.label} - ${type.description}`,
                  value: type.value
                }))}
                onChange={handleGenerate}
              />
            </Box>
          </Box>
        </Panel>
      )}

      {action === 'generating' && (
        <Panel title="Generating Documentation..." color="yellow">
          <Box flexDirection="column" gap={1}>
            <Box><Spinner /> Analyzing codebase...</Box>
            <Box><Spinner /> Extracting comments and types...</Box>
            <Box><Spinner /> Generating documentation with AI...</Box>
            <Box><Spinner /> Formatting output...</Box>
          </Box>
        </Panel>
      )}

      <Panel title="Recent Documentation" color="blue">
        <Box flexDirection="column" gap={1}>
          <Box>
            <Text color="green">{figures.tick}</Text>
            <Text> Generated API docs for /api/components</Text>
          </Box>
          <Box>
            <Text color="green">{figures.tick}</Text>
            <Text> Updated FormFactory documentation</Text>
          </Box>
          <Box>
            <Text color="green">{figures.tick}</Text>
            <Text> Created usage examples for TableFactory</Text>
          </Box>
          <Box>
            <Text color="yellow">{figures.pointer}</Text>
            <Text> Pending: Dashboard component docs</Text>
          </Box>
        </Box>
      </Panel>

      <Box marginTop={1}>
        <Text color="gray">{figures.info} Documentation saved to: </Text>
        <Text color="cyan">docs/</Text>
        <Text color="gray"> • View in browser: </Text>
        <Text color="yellow">npm run docs:serve</Text>
      </Box>

      <Footer showHelp={true} />
    </Box>
  );
};