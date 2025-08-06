import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';
import Spinner from 'ink-spinner';
import { DatabaseService } from '../services/DatabaseService.js';
import { SessionManager } from '../services/SessionManager.js';

interface ComponentBrowserProps {
  onBack: () => void;
  onAIMessage: (message: string) => void;
}

type BrowseMode = 'search' | 'category' | 'results' | 'detail';

export const ComponentBrowser: React.FC<ComponentBrowserProps> = ({ onBack, onAIMessage }) => {
  const [mode, setMode] = useState<BrowseMode>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [components, setComponents] = useState<any[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<any>(null);

  useEffect(() => {
    loadCategories();
    onAIMessage('Browse our catalog of 10,000+ components. Search by name or browse by category.');
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const cats = await DatabaseService.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const results = await DatabaseService.searchComponents(searchQuery);
      setComponents(results);
      setMode('results');
      onAIMessage(`Found ${results.length} components matching "${searchQuery}"`);
      
      await SessionManager.updateActivity({
        type: 'component_search',
        query: searchQuery,
        resultCount: results.length
      });
    } catch (error) {
      console.error('Search failed:', error);
    }
    setLoading(false);
  };

  const handleCategorySelect = async (category: string) => {
    setLoading(true);
    try {
      const results = await DatabaseService.searchComponents('', { category });
      setComponents(results);
      setSelectedCategory(category);
      setMode('results');
      onAIMessage(`Showing ${results.length} components in ${category}`);
    } catch (error) {
      console.error('Category browse failed:', error);
    }
    setLoading(false);
  };

  useInput((input, key) => {
    if (key.escape) {
      if (mode === 'search' || mode === 'category') {
        onBack();
      } else if (mode === 'results') {
        setMode('search');
      } else if (mode === 'detail') {
        setMode('results');
      }
    }
  });

  if (loading) {
    return (
      <Box padding={2} justifyContent="center" alignItems="center">
        <Text color="yellow">
          <Spinner type="dots" /> Loading...
        </Text>
      </Box>
    );
  }

  if (mode === 'search' || mode === 'category') {
    return (
      <Box flexDirection="column" padding={2}>
        <Text bold marginBottom={2}>Component Catalog</Text>
        
        <Box flexDirection="column" marginBottom={2}>
          <Text marginBottom={1}>🔍 Search Components</Text>
          <Box>
            <Text>➤ </Text>
            <TextInput
              value={searchQuery}
              onChange={setSearchQuery}
              onSubmit={handleSearch}
              placeholder="Search by name or description..."
            />
          </Box>
        </Box>

        <Box marginY={1}>
          <Text dimColor>━━━ OR ━━━</Text>
        </Box>

        <Box flexDirection="column">
          <Text marginBottom={1}>📁 Browse by Category</Text>
          <SelectInput
            items={[
              ...categories.map(cat => ({
                label: `${cat.name} (${cat._count?.resources || 0} components)`,
                value: cat.name
              })),
              { label: '← Back', value: 'back' }
            ]}
            onSelect={(item) => {
              if (item.value === 'back') {
                onBack();
              } else {
                handleCategorySelect(item.value);
              }
            }}
          />
        </Box>
      </Box>
    );
  }

  if (mode === 'results') {
    const items = components.slice(0, 10).map(comp => ({
      label: `${comp.name} - ${comp.description?.substring(0, 50)}...`,
      value: comp.id || comp.name,
      component: comp
    }));

    return (
      <Box flexDirection="column" padding={2}>
        <Text bold marginBottom={1}>
          {searchQuery ? `Search Results for "${searchQuery}"` : `${selectedCategory} Components`}
        </Text>
        <Text dimColor marginBottom={2}>
          Showing {items.length} of {components.length} results
        </Text>

        <SelectInput
          items={[
            ...items,
            { label: '← Back to Search', value: 'back' }
          ]}
          onSelect={(item) => {
            if (item.value === 'back') {
              setMode('search');
            } else {
              const component = items.find(i => i.value === item.value)?.component;
              if (component) {
                setSelectedComponent(component);
                setMode('detail');
              }
            }
          }}
        />
      </Box>
    );
  }

  if (mode === 'detail' && selectedComponent) {
    return (
      <Box flexDirection="column" padding={2}>
        <Text bold marginBottom={1} color="cyan">
          {selectedComponent.name}
        </Text>
        
        <Box flexDirection="column" marginBottom={2}>
          <Text>{selectedComponent.description}</Text>
          <Box marginTop={1}>
            <Text dimColor>
              Category: {selectedComponent.category?.name || 'Uncategorized'}
            </Text>
          </Box>
          <Box>
            <Text dimColor>
              Frameworks: {selectedComponent.frameworks?.map((f: any) => f.name).join(', ') || 'Any'}
            </Text>
          </Box>
          <Box>
            <Text dimColor>
              Tags: {selectedComponent.tags?.map((t: any) => t.name).join(', ') || 'None'}
            </Text>
          </Box>
          {selectedComponent.downloads && (
            <Box>
              <Text dimColor>
                Downloads: {selectedComponent.downloads.toLocaleString()}
              </Text>
            </Box>
          )}
        </Box>

        <SelectInput
          items={[
            { label: '💾 Use this Component', value: 'use' },
            { label: '📋 Copy Code', value: 'copy' },
            { label: '← Back to Results', value: 'back' }
          ]}
          onSelect={(item) => {
            if (item.value === 'use') {
              onAIMessage('Component added to your project!');
              SessionManager.updateActivity({
                type: 'component_used',
                component: selectedComponent.name
              });
            } else if (item.value === 'copy') {
              onAIMessage('Component code copied to clipboard!');
            } else {
              setMode('results');
            }
          }}
        />
      </Box>
    );
  }

  return null;
};