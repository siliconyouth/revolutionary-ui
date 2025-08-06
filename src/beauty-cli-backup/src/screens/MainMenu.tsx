import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import { MenuItem } from '../components/MenuItem.js';
import figures from 'figures';

interface MainMenuProps {
  onNavigate: (screen: any) => void;
}

interface MenuOption {
  id: string;
  label: string;
  description: string;
  icon: string;
  badge?: string;
  badgeColor?: string;
}

const menuOptions: MenuOption[] = [
  {
    id: 'generate',
    label: 'Generate Components',
    description: 'AI-powered component generation with 60-95% code reduction',
    icon: figures.play,
    badge: 'AI',
    badgeColor: 'cyan'
  },
  {
    id: 'analyze',
    label: 'Analyze Project',
    description: 'Deep analysis of your codebase with AI recommendations',
    icon: figures.lozenge,
    badge: 'SMART',
    badgeColor: 'green'
  },
  {
    id: 'search',
    label: 'Search Catalog',
    description: 'Search 10,000+ components with semantic AI search',
    icon: figures.star,
    badge: '10K+',
    badgeColor: 'yellow'
  },
  {
    id: 'factory',
    label: 'Factory Patterns',
    description: 'Browse 150+ component factories and patterns',
    icon: figures.squareSmall,
    badge: 'HOT',
    badgeColor: 'red'
  },
  {
    id: 'chat',
    label: 'AI Assistant',
    description: 'Chat with AI for coding help and recommendations',
    icon: figures.heart,
    badge: 'GPT-4',
    badgeColor: 'magenta'
  },
  {
    id: 'sync',
    label: 'Cloud Sync',
    description: 'Sync components and settings across devices',
    icon: figures.arrowUp,
  },
  {
    id: 'templates',
    label: 'Templates',
    description: 'Manage project templates and boilerplates',
    icon: figures.hamburger
  },
  {
    id: 'docs',
    label: 'Documentation',
    description: 'Generate and manage documentation',
    icon: figures.nodejs
  },
  {
    id: 'settings',
    label: 'Settings',
    description: 'Configure CLI preferences and AI providers',
    icon: figures.hamburger
  },
  {
    id: 'about',
    label: 'About',
    description: 'Learn more about Revolutionary UI',
    icon: figures.info
  }
];

export const MainMenu: React.FC<MainMenuProps> = ({ onNavigate }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useInput((input, key) => {
    if (key.upArrow) {
      setSelectedIndex((prev) => (prev - 1 + menuOptions.length) % menuOptions.length);
    } else if (key.downArrow) {
      setSelectedIndex((prev) => (prev + 1) % menuOptions.length);
    } else if (key.return) {
      onNavigate(menuOptions[selectedIndex].id);
    }
  });

  return (
    <Box flexDirection="column" height="100%" paddingX={2} paddingY={1}>
      <Header 
        title="Revolutionary UI CLI" 
        subtitle="AI-Powered Component Generation Factory"
      />
      
      <Box flexDirection="column" flexGrow={1} marginY={1}>
        {menuOptions.map((option, index) => (
          <Box key={option.id} marginBottom={1}>
            <MenuItem
              label={option.label}
              description={option.description}
              icon={option.icon}
              isSelected={index === selectedIndex}
              badge={option.badge}
              badgeColor={option.badgeColor || 'green'}
            />
          </Box>
        ))}
      </Box>
      
      <Footer showHelp={true} />
    </Box>
  );
};