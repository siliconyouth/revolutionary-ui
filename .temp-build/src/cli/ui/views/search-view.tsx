/**
 * Semantic Search View for Terminal UI
 */

import React, { useState, useEffect } from 'react';
import { EnhancedResourceService } from '../../../services/enhanced-resource-service.js';

interface SearchViewProps {
  resourceService: EnhancedResourceService;
  onBack: () => void;
  addLog: (message: string) => void;
}

interface SearchResult {
  id: string;
  name: string;
  description: string;
  framework: string;
  category: string;
  score?: number;
  highlights?: string[];
}

export const SearchView: React.FC<SearchViewProps> = ({ 
  resourceService, 
  onBack, 
  addLog 
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedResult, setSelectedResult] = useState(0);
  const [searching, setSearching] = useState(false);
  const [searchMode, setSearchMode] = useState<'semantic' | 'keyword'>('semantic');
  const [filters, setFilters] = useState({
    framework: '',
    category: '',
    minRating: 0
  });

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setSearching(true);
    addLog(`Performing ${searchMode} search for: ${searchQuery}`);

    try {
      const searchResults = await resourceService.searchComponents(searchQuery, {
        limit: 20,
        framework: filters.framework || undefined,
        category: filters.category || undefined
      });

      setResults(searchResults.map((r: any) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        framework: r.framework,
        category: r.category || 'Uncategorized',
        score: r.score,
        highlights: r.highlights
      })));

      addLog(`Found ${searchResults.length} results`);
    } catch (error) {
      addLog('Search failed: ' + (error as Error).message);
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const selectedResultData = results[selectedResult];

  return (
    <>
      {/* Search Input */}
      <box
        top={4}
        left={0}
        width="100%"
        height={5}
        border={{ type: 'line' }}
        style={{
          border: { fg: 'cyan' },
          label: { fg: 'magenta' }
        }}
        label=" Search Components "
      >
        <text
          top={0}
          left={1}
          content={`Mode: {${searchMode === 'semantic' ? 'green' : 'yellow'}-fg}${searchMode.toUpperCase()}{/} | Query: ${query || '{gray-fg}Type to search...{/gray-fg}'}`}
          tags={true}
        />
        <text
          top={1}
          left={1}
          content={`{gray-fg}Press TAB to switch modes | Enter to search | ESC to go back{/gray-fg}`}
          tags={true}
        />
      </box>

      {/* Search Filters */}
      <box
        top={9}
        left={0}
        width="25%"
        height={20}
        border={{ type: 'line' }}
        style={{
          border: { fg: 'cyan' },
          label: { fg: 'magenta' }
        }}
        label=" Filters "
        content={`
{yellow-fg}Framework:{/yellow-fg}
${filters.framework || 'All'}

{yellow-fg}Category:{/yellow-fg}
${filters.category || 'All'}

{yellow-fg}Min Rating:{/yellow-fg}
${filters.minRating} stars

{gray-fg}━━━━━━━━━━━━━━━━━━━━━{/gray-fg}
Press F to edit filters
        `}
        tags={true}
      />

      {/* Search Results */}
      <box
        top={9}
        left="25%"
        width="40%"
        height={20}
        border={{ type: 'line' }}
        style={{
          border: { fg: 'cyan' },
          label: { fg: 'magenta' }
        }}
        label={` Results ${searching ? '(Searching...)' : results.length > 0 ? `(${results.length} found)` : ''} `}
      >
        {searching ? (
          <text
            content="{center}Searching...{/center}"
            tags={true}
          />
        ) : results.length === 0 ? (
          <text
            content={query ? "{center}No results found{/center}" : "{center}Enter a search query{/center}"}
            tags={true}
          />
        ) : (
          <list
            items={results.map((result, i) => {
              const prefix = i === selectedResult ? '> ' : '  ';
              const scoreStr = result.score ? ` (${(result.score * 100).toFixed(0)}%)` : '';
              return `${prefix}${result.name}${scoreStr}`;
            })}
            style={{
              selected: { bg: 'blue', fg: 'white' }
            }}
          />
        )}
      </box>

      {/* Result Details */}
      <box
        top={9}
        left="65%"
        width="35%"
        height={20}
        border={{ type: 'line' }}
        style={{
          border: { fg: 'cyan' },
          label: { fg: 'magenta' }
        }}
        label=" Component Details "
        content={selectedResultData ? `
{bold}${selectedResultData.name}{/bold}
{gray-fg}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{/gray-fg}

{cyan-fg}Framework:{/cyan-fg} ${selectedResultData.framework}
{cyan-fg}Category:{/cyan-fg} ${selectedResultData.category}
${selectedResultData.score ? `{cyan-fg}Match Score:{/cyan-fg} ${(selectedResultData.score * 100).toFixed(0)}%` : ''}

{yellow-fg}Description:{/yellow-fg}
${selectedResultData.description || 'No description available'}

${selectedResultData.highlights && selectedResultData.highlights.length > 0 ? `
{yellow-fg}Highlights:{/yellow-fg}
${selectedResultData.highlights.map(h => `• ${h}`).join('\\n')}` : ''}

{gray-fg}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{/gray-fg}
{green-fg}Press Enter to use this component{/green-fg}
        ` : '{center}Select a result to view details{/center}'}
        tags={true}
        scrollable={true}
        alwaysScroll={true}
      />

      {/* Search Stats */}
      <box
        top={29}
        left={0}
        width="100%"
        height={5}
        border={{ type: 'line' }}
        style={{
          border: { fg: 'cyan' },
          label: { fg: 'magenta' }
        }}
        label=" Search Intelligence "
        content={`
{center}Revolutionary UI uses {${searchMode === 'semantic' ? 'green' : 'yellow'}-fg}${searchMode === 'semantic' ? 'AI-powered semantic search' : 'traditional keyword search'}{/} to find the best components{/center}
{center}{gray-fg}Semantic search understands intent and finds conceptually similar components{/gray-fg}{/center}
        `}
        tags={true}
      />

      {/* Instructions */}
      <box
        bottom={3}
        left={0}
        width="100%"
        height={3}
        border={{ type: 'line' }}
        style={{
          border: { fg: 'cyan' }
        }}
        content="{center}TAB: Switch Mode | ↑↓: Navigate Results | Enter: Select | F: Filters | ESC: Back{/center}"
        tags={true}
      />
    </>
  );
};