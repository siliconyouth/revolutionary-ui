import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import { Panel } from '../components/Panel.js';
import { TextInput, Spinner } from '@inkjs/ui';
import figures from 'figures';

interface SearchScreenProps {
  onBack: () => void;
  query?: string;
}

interface SearchResult {
  name: string;
  framework: string;
  category: string;
  description: string;
  downloads: number;
  stars: number;
  match: 'exact' | 'semantic' | 'keyword';
}

export const SearchScreen: React.FC<SearchScreenProps> = ({ onBack, query: initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  useInput((input, key) => {
    if (key.escape && !isTyping) {
      onBack();
    } else if (key.upArrow && !isTyping) {
      setSelectedIndex(prev => Math.max(0, prev - 1));
    } else if (key.downArrow && !isTyping) {
      setSelectedIndex(prev => Math.min(results.length - 1, prev + 1));
    }
  });

  const performSearch = () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    // Simulate search
    setTimeout(() => {
      setResults([
        {
          name: 'DataTable',
          framework: 'React',
          category: 'Data Display',
          description: 'Advanced data table with sorting, filtering, and pagination',
          downloads: 125000,
          stars: 3400,
          match: 'exact'
        },
        {
          name: 'ResponsiveTable',
          framework: 'Vue',
          category: 'Data Display',
          description: 'Mobile-first responsive table component',
          downloads: 89000,
          stars: 2100,
          match: 'semantic'
        },
        {
          name: 'MaterialDataGrid',
          framework: 'Angular',
          category: 'Data Display',
          description: 'Material Design data grid with virtual scrolling',
          downloads: 67000,
          stars: 1800,
          match: 'keyword'
        },
        {
          name: 'TableFactory',
          framework: 'Universal',
          category: 'Factory Pattern',
          description: 'Generate any table component with 85% code reduction',
          downloads: 45000,
          stars: 890,
          match: 'semantic'
        }
      ]);
      setIsSearching(false);
    }, 1500);
  };

  useEffect(() => {
    if (initialQuery) {
      performSearch();
    }
  }, []);

  return (
    <Box flexDirection="column">
      <Header 
        title="Component Catalog Search" 
        subtitle="Search 10,000+ components with AI-powered semantic matching"
      />

      <Panel title="Search Components" color="cyan">
        <Box flexDirection="column" gap={1}>
          <Box>
            <Text>Search Query: </Text>
            <TextInput
              defaultValue={query}
              onChange={setQuery}
              onSubmit={performSearch}
              placeholder="e.g., data table, user form, dashboard..."
            />
          </Box>
          <Box>
            <Text color="gray">{figures.info} Press Enter to search • Use natural language queries</Text>
          </Box>
        </Box>
      </Panel>

      {isSearching && (
        <Panel title="Searching..." color="yellow">
          <Box flexDirection="column" gap={1}>
            <Box><Spinner /> Searching component catalog...</Box>
            <Box><Spinner /> Running semantic analysis...</Box>
            <Box><Spinner /> Matching patterns...</Box>
          </Box>
        </Panel>
      )}

      {!isSearching && results.length > 0 && (
        <>
          <Panel title={`Found ${results.length} Components`} color="green">
            <Box flexDirection="column" gap={1}>
              {results.map((result, index) => (
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
                      <Text color="yellow" bold>{result.name}</Text>
                      <Text color="gray"> • {result.framework}</Text>
                      <Text color="magenta"> • {result.category}</Text>
                      {result.match === 'exact' && <Text color="green"> [EXACT]</Text>}
                      {result.match === 'semantic' && <Text color="blue"> [AI MATCH]</Text>}
                    </Box>
                    <Box marginLeft={2}>
                      <Text color="gray">{result.description}</Text>
                    </Box>
                    <Box marginLeft={2} marginTop={1}>
                      <Text color="gray">{figures.arrowDown} {result.downloads.toLocaleString()}</Text>
                      <Text color="gray"> • </Text>
                      <Text color="gray">{figures.star} {result.stars.toLocaleString()}</Text>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Panel>

          <Box marginTop={1}>
            <Text color="gray">Use </Text>
            <Text color="yellow">↑↓</Text>
            <Text color="gray"> to navigate • </Text>
            <Text color="yellow">Enter</Text>
            <Text color="gray"> to generate • </Text>
            <Text color="yellow">ESC</Text>
            <Text color="gray"> to go back</Text>
          </Box>
        </>
      )}

      {!isSearching && results.length === 0 && query && (
        <Panel title="No Results" color="red">
          <Text>No components found matching "{query}"</Text>
        </Panel>
      )}

      <Footer showHelp={true} />
    </Box>
  );
};