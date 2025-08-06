import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import { Panel } from '../components/Panel.js';
import { Badge } from '@inkjs/ui';
import figures from 'figures';

interface FactoryScreenProps {
  onBack: () => void;
}

interface Factory {
  name: string;
  category: string;
  description: string;
  codeReduction: number;
  frameworks: string[];
  components: string[];
  complexity: 'low' | 'medium' | 'high';
}

const factories: Factory[] = [
  {
    name: 'FormFactory',
    category: 'Forms',
    description: 'Generate dynamic forms with validation, conditional fields, and layouts',
    codeReduction: 85,
    frameworks: ['React', 'Vue', 'Angular', 'Svelte'],
    components: ['LoginForm', 'RegistrationForm', 'ContactForm', 'SurveyForm'],
    complexity: 'low'
  },
  {
    name: 'TableFactory',
    category: 'Data Display',
    description: 'Create data tables with sorting, filtering, pagination, and actions',
    codeReduction: 78,
    frameworks: ['React', 'Vue', 'Angular'],
    components: ['DataTable', 'GridView', 'TreeTable', 'EditableTable'],
    complexity: 'medium'
  },
  {
    name: 'DashboardFactory',
    category: 'Layouts',
    description: 'Build complete dashboards with widgets, charts, and responsive layouts',
    codeReduction: 92,
    frameworks: ['React', 'Vue'],
    components: ['AdminDashboard', 'AnalyticsDashboard', 'SalesDashboard'],
    complexity: 'high'
  },
  {
    name: 'ChartFactory',
    category: 'Visualization',
    description: 'Generate charts and graphs with real-time data updates',
    codeReduction: 73,
    frameworks: ['React', 'Vue', 'Svelte'],
    components: ['LineChart', 'BarChart', 'PieChart', 'ScatterPlot'],
    complexity: 'medium'
  },
  {
    name: 'GameUIFactory',
    category: 'Gaming',
    description: 'Create game interfaces including HUD, inventory, and menus',
    codeReduction: 88,
    frameworks: ['React', 'Phaser', 'Universal'],
    components: ['HUD', 'Inventory', 'QuestLog', 'SkillTree'],
    complexity: 'high'
  }
];

export const FactoryScreen: React.FC<FactoryScreenProps> = ({ onBack }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  useInput((input, key) => {
    if (key.escape) {
      if (showDetails) {
        setShowDetails(false);
      } else {
        onBack();
      }
    } else if (key.upArrow && !showDetails) {
      setSelectedIndex(prev => Math.max(0, prev - 1));
    } else if (key.downArrow && !showDetails) {
      setSelectedIndex(prev => Math.min(factories.length - 1, prev + 1));
    } else if (key.return) {
      setShowDetails(true);
    }
  });

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'green';
      case 'medium': return 'yellow';
      case 'high': return 'red';
      default: return 'gray';
    }
  };

  const selectedFactory = factories[selectedIndex];

  return (
    <Box flexDirection="column">
      <Header 
        title="Factory Pattern Browser" 
        subtitle="150+ component factories with 60-95% code reduction"
      />

      {!showDetails ? (
        <>
          <Panel title="Available Factories" color="cyan">
            <Box flexDirection="column" gap={1}>
              {factories.map((factory, index) => (
                <Box 
                  key={index}
                  borderStyle="single"
                  borderColor={index === selectedIndex ? 'cyan' : 'gray'}
                  paddingX={1}
                  marginBottom={1}
                >
                  <Box flexDirection="column">
                    <Box>
                      {index === selectedIndex && <Text color="cyan">{figures.pointer} </Text>}
                      <Text color="yellow" bold>{factory.name}</Text>
                      <Text color="gray"> • </Text>
                      <Badge color="blue">{factory.category}</Badge>
                      <Text color="gray"> • </Text>
                      <Text color="green" bold>{factory.codeReduction}% reduction</Text>
                    </Box>
                    <Box marginLeft={2} marginTop={1}>
                      <Text color="gray">{factory.description}</Text>
                    </Box>
                    <Box marginLeft={2}>
                      <Badge color={getComplexityColor(factory.complexity)}>
                        {factory.complexity.toUpperCase()}
                      </Badge>
                      <Text color="gray"> • </Text>
                      <Text color="cyan">{factory.frameworks.length} frameworks</Text>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Panel>

          <Box marginTop={1}>
            <Text color="gray">Press </Text>
            <Text color="yellow">Enter</Text>
            <Text color="gray"> to view details • </Text>
            <Text color="yellow">G</Text>
            <Text color="gray"> to generate • </Text>
            <Text color="yellow">ESC</Text>
            <Text color="gray"> to go back</Text>
          </Box>
        </>
      ) : (
        <>
          <Panel title={`${selectedFactory.name} Details`} color="magenta">
            <Box flexDirection="column" gap={1}>
              <Box>
                <Text color="cyan">Category: </Text>
                <Text>{selectedFactory.category}</Text>
              </Box>
              <Box>
                <Text color="cyan">Code Reduction: </Text>
                <Text color="green" bold>{selectedFactory.codeReduction}%</Text>
              </Box>
              <Box>
                <Text color="cyan">Complexity: </Text>
                <Badge color={getComplexityColor(selectedFactory.complexity)}>
                  {selectedFactory.complexity.toUpperCase()}
                </Badge>
              </Box>
            </Box>
          </Panel>

          <Panel title="Supported Frameworks" color="green">
            <Box flexDirection="row" flexWrap="wrap" gap={1}>
              {selectedFactory.frameworks.map((fw, i) => (
                <Badge key={i} color="blue">{fw}</Badge>
              ))}
            </Box>
          </Panel>

          <Panel title="Example Components" color="yellow">
            <Box flexDirection="column" gap={1}>
              {selectedFactory.components.map((comp, i) => (
                <Box key={i}>
                  <Text color="green">{figures.play}</Text>
                  <Text> {comp}</Text>
                </Box>
              ))}
            </Box>
          </Panel>

          <Panel title="Usage Example" color="blue">
            <Box flexDirection="column">
              <Text color="gray">// Generate a component using this factory:</Text>
              <Text color="cyan">revui generate {selectedFactory.name.toLowerCase()} --name=MyComponent</Text>
              <Box marginTop={1}>
                <Text color="gray">// Or use in code:</Text>
              </Box>
              <Text color="cyan">import {`{ ${selectedFactory.name} }`} from '@revui/factories';</Text>
              <Text color="cyan">const component = {selectedFactory.name}.create(config);</Text>
            </Box>
          </Panel>
        </>
      )}

      <Footer showHelp={true} />
    </Box>
  );
};