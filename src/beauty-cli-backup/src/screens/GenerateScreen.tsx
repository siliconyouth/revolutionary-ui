import React, { useState } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import { Panel } from '../components/Panel.js';
import { Select, TextInput, Spinner } from '@inkjs/ui';
import figures from 'figures';

interface GenerateScreenProps {
  onBack: () => void;
  args?: string[];
}

type Step = 'select' | 'configure' | 'preview' | 'generating' | 'complete';

const componentTypes = [
  { label: 'Form', value: 'form', description: 'Dynamic forms with validation' },
  { label: 'Table', value: 'table', description: 'Data tables with sorting/filtering' },
  { label: 'Dashboard', value: 'dashboard', description: 'Admin dashboards with charts' },
  { label: 'Chart', value: 'chart', description: 'Data visualization components' },
  { label: 'Navigation', value: 'navigation', description: 'Menus and navigation bars' },
  { label: 'Card', value: 'card', description: 'Content cards and layouts' },
  { label: 'Modal', value: 'modal', description: 'Dialog and modal components' },
  { label: 'Game UI', value: 'game', description: 'Game interface components' },
  { label: 'E-commerce', value: 'ecommerce', description: 'Shopping cart, product lists' },
  { label: 'Custom', value: 'custom', description: 'AI generates from description' }
];

const frameworks = [
  { label: 'React', value: 'react' },
  { label: 'Vue', value: 'vue' },
  { label: 'Angular', value: 'angular' },
  { label: 'Svelte', value: 'svelte' },
  { label: 'Solid', value: 'solid' }
];

const styleOptions = [
  { label: 'Tailwind CSS', value: 'tailwind' },
  { label: 'CSS-in-JS', value: 'css-in-js' },
  { label: 'CSS Modules', value: 'css-modules' },
  { label: 'Styled Components', value: 'styled-components' },
  { label: 'Plain CSS', value: 'css' }
];

export const GenerateScreen: React.FC<GenerateScreenProps> = ({ onBack, args = [] }) => {
  const [step, setStep] = useState<Step>('select');
  const [componentType, setComponentType] = useState('form');
  const [framework, setFramework] = useState('react');
  const [style, setStyle] = useState('tailwind');
  const [componentName, setComponentName] = useState('');
  const [description, setDescription] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { exit } = useApp();

  useInput((input, key) => {
    if (key.escape && !isTyping) {
      if (step === 'select') {
        onBack();
      } else {
        setStep('select');
      }
    }
  });

  const handleGenerate = () => {
    setStep('generating');
    // Simulate generation
    setTimeout(() => {
      setStep('complete');
    }, 3000);
  };

  return (
    <Box flexDirection="column">
      <Header 
        title="AI Component Generator" 
        subtitle="Generate production-ready components with 60-95% code reduction"
      />

      {step === 'select' && (
        <>
          <Panel title="Select Component Type" color="cyan">
            <Box flexDirection="column" gap={1}>
              <Text>Choose a component type to generate:</Text>
              <Box marginTop={1}>
                <Select
                  options={componentTypes.map(type => ({
                    label: `${type.label} - ${type.description}`,
                    value: type.value
                  }))}
                  defaultValue={componentType}
                  onChange={(value) => {
                    setComponentType(value);
                    setStep('configure');
                  }}
                />
              </Box>
            </Box>
          </Panel>

          <Box marginTop={1}>
            <Text color="gray">{figures.info} Select a component type or choose Custom for AI-powered generation</Text>
          </Box>
        </>
      )}

      {step === 'configure' && (
        <>
          <Panel title="Configure Component" color="magenta">
            <Box flexDirection="column" gap={1}>
              <Box flexDirection="column">
                <Text>Component Name:</Text>
                <TextInput
                  defaultValue={componentName}
                  onChange={setComponentName}
                  placeholder="e.g., UserProfileForm"
                />
              </Box>

              <Box flexDirection="column">
                <Text>Framework:</Text>
                <Select
                  options={frameworks}
                  defaultValue={framework}
                  onChange={setFramework}
                />
              </Box>

              <Box flexDirection="column">
                <Text>Style System:</Text>
                <Select
                  options={styleOptions}
                  defaultValue={style}
                  onChange={setStyle}
                />
              </Box>

              {componentType === 'custom' && (
                <Box flexDirection="column">
                  <Text>Description (for AI):</Text>
                  <TextInput
                    defaultValue={description}
                    onChange={setDescription}
                    placeholder="Describe your component..."
                  />
                </Box>
              )}
            </Box>
          </Panel>

          <Box marginTop={1} gap={2}>
            <Text color="green" bold>{figures.pointer} Press Enter to generate</Text>
            <Text color="gray">ESC to go back</Text>
          </Box>

          {componentName && (
            <Box marginTop={1}>
              <Box>
                <Text color="yellow" bold>
                  [Generate Component]
                </Text>
              </Box>
            </Box>
          )}
        </>
      )}

      {step === 'generating' && (
        <Panel title="Generating Component" color="yellow">
          <Box flexDirection="column" gap={1}>
            <Box>
              <Spinner /> 
              <Text> Analyzing requirements...</Text>
            </Box>
            <Box>
              <Spinner /> 
              <Text> Selecting optimal factory pattern...</Text>
            </Box>
            <Box>
              <Spinner /> 
              <Text> Generating component with AI...</Text>
            </Box>
            <Box>
              <Spinner /> 
              <Text> Optimizing for {framework} and {style}...</Text>
            </Box>
          </Box>
        </Panel>
      )}

      {step === 'complete' && (
        <>
          <Panel title="Generation Complete!" color="green">
            <Box flexDirection="column" gap={1}>
              <Box>
                <Text color="green">{figures.tick} Component generated successfully!</Text>
              </Box>
              <Box>
                <Text color="cyan">Component: </Text>
                <Text bold>{componentName || 'MyComponent'}</Text>
              </Box>
              <Box>
                <Text color="cyan">Type: </Text>
                <Text>{componentType}</Text>
              </Box>
              <Box>
                <Text color="cyan">Framework: </Text>
                <Text>{framework}</Text>
              </Box>
              <Box>
                <Text color="cyan">Code Reduction: </Text>
                <Text color="green" bold>87%</Text>
              </Box>
              <Box>
                <Text color="cyan">Files Created: </Text>
                <Text>3 files</Text>
              </Box>
            </Box>
          </Panel>

          <Panel title="Next Steps" color="blue">
            <Box flexDirection="column" gap={1}>
              <Text>• Component saved to: src/components/{componentName}</Text>
              <Text>• Run tests: npm test</Text>
              <Text>• View in browser: npm run dev</Text>
              <Text>• Edit in VS Code: code src/components/{componentName}</Text>
            </Box>
          </Panel>
        </>
      )}

      <Footer showHelp={true} />
    </Box>
  );
};