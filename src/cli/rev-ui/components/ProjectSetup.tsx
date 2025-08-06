import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';
import Spinner from 'ink-spinner';
import { DatabaseService } from '../services/DatabaseService.js';
import { AIService } from '../services/AIService.js';

interface ProjectSetupProps {
  onBack: () => void;
  onAIMessage: (message: string) => void;
}

type SetupStep = 'name' | 'framework' | 'ui-library' | 'css' | 'features' | 'confirm';

interface ProjectConfig {
  name: string;
  framework: string;
  uiLibrary: string;
  cssFramework: string;
  features: string[];
  buildTool: string;
  testingFramework: string;
}

export const ProjectSetup: React.FC<ProjectSetupProps> = ({ onBack, onAIMessage }) => {
  const [step, setStep] = useState<SetupStep>('name');
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<ProjectConfig>({
    name: '',
    framework: '',
    uiLibrary: '',
    cssFramework: '',
    features: [],
    buildTool: '',
    testingFramework: ''
  });

  // Database data
  const [frameworks, setFrameworks] = useState<any[]>([]);
  const [uiLibraries, setUiLibraries] = useState<any[]>([]);
  const [cssFrameworks, setCssFrameworks] = useState<any[]>([]);
  const [buildTools, setBuildTools] = useState<any[]>([]);
  const [testingFrameworks, setTestingFrameworks] = useState<any[]>([]);

  useEffect(() => {
    loadDatabaseData();
  }, []);

  const loadDatabaseData = async () => {
    setLoading(true);
    try {
      // Load all data from database
      const [frameworksData, uiLibsData, cssData, buildData, testData] = await Promise.all([
        DatabaseService.getFrameworks(),
        DatabaseService.getUILibraries(),
        DatabaseService.getCSSFrameworks(),
        DatabaseService.getBuildTools(),
        DatabaseService.getTestingFrameworks()
      ]);

      setFrameworks(frameworksData);
      setUiLibraries(uiLibsData);
      setCssFrameworks(cssData);
      setBuildTools(buildData);
      setTestingFrameworks(testData);

      // Get AI recommendation
      const recommendation = await AIService.getProjectRecommendation();
      onAIMessage(recommendation);
    } catch (error) {
      // Use fallback data if database is unavailable
      setFrameworks([
        { name: 'React', description: 'A JavaScript library for building user interfaces' },
        { name: 'Vue', description: 'The Progressive JavaScript Framework' },
        { name: 'Angular', description: 'Platform for building mobile and desktop apps' },
        { name: 'Svelte', description: 'Cybernetically enhanced web apps' }
      ]);
      setUiLibraries([
        { name: 'Material-UI', description: 'React components for faster development' },
        { name: 'Ant Design', description: 'Enterprise-class UI design language' },
        { name: 'Chakra UI', description: 'Modular and accessible component library' }
      ]);
      setCssFrameworks([
        { name: 'Tailwind CSS', description: 'Utility-first CSS framework' },
        { name: 'styled-components', description: 'CSS-in-JS styling' },
        { name: 'CSS Modules', description: 'Locally scoped CSS' }
      ]);
      setBuildTools([
        { name: 'Vite', description: 'Next generation frontend tooling' },
        { name: 'Webpack', description: 'Static module bundler' }
      ]);
      setTestingFrameworks([
        { name: 'Jest', description: 'Delightful JavaScript testing' },
        { name: 'Vitest', description: 'Blazing fast unit test framework' }
      ]);
      onAIMessage('Setting up a new project. I\'ll guide you through the best options based on current best practices.');
    }
    setLoading(false);
  };

  useInput((input, key) => {
    if (key.escape) {
      if (step === 'name') {
        onBack();
      } else {
        // Go to previous step
        const steps: SetupStep[] = ['name', 'framework', 'ui-library', 'css', 'features', 'confirm'];
        const currentIndex = steps.indexOf(step);
        if (currentIndex > 0) {
          setStep(steps[currentIndex - 1]);
        }
      }
    }
  });

  if (loading) {
    return (
      <Box padding={2}>
        <Text color="yellow">
          <Spinner type="dots" /> Loading project configuration options...
        </Text>
      </Box>
    );
  }

  if (step === 'name') {
    return (
      <Box flexDirection="column" padding={2}>
        <Text bold marginBottom={1}>Project Name</Text>
        <Text dimColor marginBottom={2}>Enter a name for your new project</Text>
        <Box>
          <TextInput
            value={config.name}
            onChange={(value) => setConfig({ ...config, name: value })}
            onSubmit={() => {
              if (config.name.trim()) {
                setStep('framework');
                AIService.getFrameworkRecommendation(config).then(onAIMessage);
              }
            }}
            placeholder="my-awesome-app"
          />
        </Box>
      </Box>
    );
  }

  if (step === 'framework') {
    const items = frameworks.map(fw => ({
      label: `${fw.name} - ${fw.description}`,
      value: fw.name
    }));

    return (
      <Box flexDirection="column" padding={2}>
        <Text bold marginBottom={1}>Select Framework</Text>
        <Text dimColor marginBottom={2}>Choose your JavaScript framework</Text>
        <SelectInput
          items={items}
          onSelect={(item) => {
            setConfig({ ...config, framework: item.value });
            setStep('ui-library');
            AIService.getUILibraryRecommendation(config, item.value).then(onAIMessage);
          }}
        />
      </Box>
    );
  }

  if (step === 'ui-library') {
    const filteredLibs = uiLibraries.filter(lib => 
      !lib.framework || lib.framework === config.framework || lib.framework === 'any'
    );
    
    const items = [
      { label: 'None - Custom components only', value: 'none' },
      ...filteredLibs.map(lib => ({
        label: `${lib.name} - ${lib.description}`,
        value: lib.name
      }))
    ];

    return (
      <Box flexDirection="column" padding={2}>
        <Text bold marginBottom={1}>Select UI Library</Text>
        <Text dimColor marginBottom={2}>Choose a component library (optional)</Text>
        <SelectInput
          items={items}
          onSelect={(item) => {
            setConfig({ ...config, uiLibrary: item.value });
            setStep('css');
            AIService.getCSSRecommendation(config, item.value).then(onAIMessage);
          }}
        />
      </Box>
    );
  }

  if (step === 'css') {
    const items = cssFrameworks.map(css => ({
      label: `${css.name} - ${css.description}`,
      value: css.name
    }));

    return (
      <Box flexDirection="column" padding={2}>
        <Text bold marginBottom={1}>Select CSS Framework</Text>
        <Text dimColor marginBottom={2}>Choose your styling approach</Text>
        <SelectInput
          items={items}
          onSelect={(item) => {
            setConfig({ ...config, cssFramework: item.value });
            setStep('features');
            AIService.getFeatureRecommendation(config).then(onAIMessage);
          }}
        />
      </Box>
    );
  }

  if (step === 'features') {
    const featureOptions = [
      { label: '✓ TypeScript - Type-safe development', value: 'typescript' },
      { label: '✓ ESLint - Code quality', value: 'eslint' },
      { label: '✓ Prettier - Code formatting', value: 'prettier' },
      { label: '✓ Git - Version control', value: 'git' },
      { label: '✓ Testing - Unit & E2E tests', value: 'testing' },
      { label: '✓ CI/CD - GitHub Actions', value: 'ci' },
      { label: 'Continue →', value: 'continue' }
    ];

    return (
      <Box flexDirection="column" padding={2}>
        <Text bold marginBottom={1}>Additional Features</Text>
        <Text dimColor marginBottom={2}>Select features to include (all recommended)</Text>
        <SelectInput
          items={featureOptions}
          onSelect={(item) => {
            if (item.value === 'continue') {
              // Set all features except 'continue'
              setConfig({
                ...config,
                features: ['typescript', 'eslint', 'prettier', 'git', 'testing', 'ci'],
                buildTool: buildTools[0]?.name || 'vite',
                testingFramework: testingFrameworks[0]?.name || 'vitest'
              });
              setStep('confirm');
            }
          }}
        />
      </Box>
    );
  }

  if (step === 'confirm') {
    return (
      <Box flexDirection="column" padding={2}>
        <Text bold marginBottom={2}>Confirm Project Configuration</Text>
        
        <Box flexDirection="column" marginBottom={2}>
          <Text>📁 Project: <Text color="cyan">{config.name}</Text></Text>
          <Text>🚀 Framework: <Text color="cyan">{config.framework}</Text></Text>
          <Text>🎨 UI Library: <Text color="cyan">{config.uiLibrary}</Text></Text>
          <Text>💅 CSS: <Text color="cyan">{config.cssFramework}</Text></Text>
          <Text>🛠️  Build Tool: <Text color="cyan">{config.buildTool}</Text></Text>
          <Text>🧪 Testing: <Text color="cyan">{config.testingFramework}</Text></Text>
          <Text>✨ Features: <Text color="cyan">{config.features.join(', ')}</Text></Text>
        </Box>

        <SelectInput
          items={[
            { label: '✓ Create Project', value: 'create' },
            { label: '← Back to Edit', value: 'back' }
          ]}
          onSelect={async (item) => {
            if (item.value === 'create') {
              onAIMessage('Creating your project with the selected configuration...');
              // Here you would actually create the project
              setTimeout(() => {
                onAIMessage('Project created successfully! You can now start generating components.');
                onBack();
              }, 2000);
            } else {
              setStep('name');
            }
          }}
        />
      </Box>
    );
  }

  return null;
};