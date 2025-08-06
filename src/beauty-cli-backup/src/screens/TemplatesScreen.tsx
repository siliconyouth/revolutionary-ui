import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import { Panel } from '../components/Panel.js';
import { Badge } from '@inkjs/ui';
import figures from 'figures';

interface TemplatesScreenProps {
  onBack: () => void;
}

interface Template {
  name: string;
  description: string;
  framework: string;
  category: string;
  components: number;
  popularity: 'high' | 'medium' | 'low';
}

const templates: Template[] = [
  {
    name: 'SaaS Dashboard',
    description: 'Complete admin dashboard with auth, charts, and data tables',
    framework: 'React',
    category: 'Business',
    components: 24,
    popularity: 'high'
  },
  {
    name: 'E-commerce Store',
    description: 'Full shopping cart with product catalog and checkout',
    framework: 'Vue',
    category: 'E-commerce',
    components: 18,
    popularity: 'high'
  },
  {
    name: 'Social Media App',
    description: 'Feed, profiles, messaging, and notifications',
    framework: 'React',
    category: 'Social',
    components: 32,
    popularity: 'medium'
  },
  {
    name: 'Game UI Kit',
    description: 'HUD, inventory, character stats, and menus',
    framework: 'Universal',
    category: 'Gaming',
    components: 15,
    popularity: 'medium'
  },
  {
    name: 'Landing Page',
    description: 'Hero, features, pricing, testimonials, and CTA',
    framework: 'Astro',
    category: 'Marketing',
    components: 8,
    popularity: 'high'
  }
];

export const TemplatesScreen: React.FC<TemplatesScreenProps> = ({ onBack }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useInput((input, key) => {
    if (key.escape) {
      onBack();
    } else if (key.upArrow) {
      setSelectedIndex(prev => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setSelectedIndex(prev => Math.min(templates.length - 1, prev + 1));
    }
  });

  const getPopularityColor = (popularity: string) => {
    switch (popularity) {
      case 'high': return 'green';
      case 'medium': return 'yellow';
      case 'low': return 'gray';
      default: return 'gray';
    }
  };

  return (
    <Box flexDirection="column">
      <Header 
        title="Template Manager" 
        subtitle="Start with production-ready templates"
      />

      <Panel title="Available Templates" color="cyan">
        <Box flexDirection="column" gap={1}>
          {templates.map((template, index) => (
            <Box 
              key={index}
              borderStyle="single"
              borderColor={index === selectedIndex ? 'cyan' : 'gray'}
              paddingX={1}
              paddingY={1}
              marginBottom={1}
            >
              <Box flexDirection="column">
                <Box>
                  {index === selectedIndex && <Text color="cyan">{figures.pointer} </Text>}
                  <Text color="yellow" bold>{template.name}</Text>
                  <Text color="gray"> • </Text>
                  <Badge color="blue">{template.framework}</Badge>
                  <Text color="gray"> • </Text>
                  <Badge color={getPopularityColor(template.popularity)}>
                    {template.popularity.toUpperCase()}
                  </Badge>
                </Box>
                <Box marginLeft={2} marginTop={1}>
                  <Text color="gray">{template.description}</Text>
                </Box>
                <Box marginLeft={2} marginTop={1}>
                  <Text color="cyan">Category: </Text>
                  <Text>{template.category}</Text>
                  <Text color="gray"> • </Text>
                  <Text color="cyan">Components: </Text>
                  <Text>{template.components}</Text>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Panel>

      <Box flexDirection="row" gap={1}>
        <Panel title="Quick Actions" color="green" width={40}>
          <Box flexDirection="column" gap={1}>
            <Text>{figures.play} Press Enter to use template</Text>
            <Text>{figures.star} Press S to save as favorite</Text>
            <Text>{figures.radioOn} Press V to preview</Text>
            <Text>{figures.arrowUp} Press C to clone</Text>
          </Box>
        </Panel>

        <Panel title="Template Stats" color="magenta" width={40}>
          <Box flexDirection="column" gap={1}>
            <Text>Total Templates: {templates.length}</Text>
            <Text>Your Templates: 3</Text>
            <Text>Downloaded: 12</Text>
            <Text>Last Updated: 2 days ago</Text>
          </Box>
        </Panel>
      </Box>

      <Footer showHelp={true} />
    </Box>
  );
};