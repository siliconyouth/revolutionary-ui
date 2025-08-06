import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import { Panel } from '../components/Panel.js';
import { Select, Spinner, Badge } from '@inkjs/ui';
import figures from 'figures';

interface SyncScreenProps {
  onBack: () => void;
}

type SyncAction = 'idle' | 'push' | 'pull' | 'sync';

export const SyncScreen: React.FC<SyncScreenProps> = ({ onBack }) => {
  const [action, setAction] = useState<SyncAction>('idle');
  const [selectedOption, setSelectedOption] = useState('');

  useInput((input, key) => {
    if (key.escape) {
      onBack();
    }
  });

  const syncOptions = [
    { label: 'Push to Cloud', value: 'push', description: 'Upload local components' },
    { label: 'Pull from Cloud', value: 'pull', description: 'Download cloud components' },
    { label: 'Two-way Sync', value: 'sync', description: 'Sync all changes' },
    { label: 'View Status', value: 'status', description: 'Check sync status' }
  ];

  const handleSync = (option: string) => {
    setSelectedOption(option);
    setAction(option as SyncAction);
    
    // Simulate sync
    setTimeout(() => {
      setAction('idle');
    }, 3000);
  };

  return (
    <Box flexDirection="column">
      <Header 
        title="Cloud Sync Manager" 
        subtitle="Sync components and settings with Cloudflare R2"
      />

      <Box flexDirection="row" gap={1}>
        <Panel title="Sync Status" color="cyan" width={40}>
          <Box flexDirection="column" gap={1}>
            <Box>
              <Text color="cyan">Cloud Storage: </Text>
              <Badge color="green">Connected</Badge>
            </Box>
            <Box>
              <Text color="cyan">Last Sync: </Text>
              <Text>2 hours ago</Text>
            </Box>
            <Box>
              <Text color="cyan">Components: </Text>
              <Text>47 local, 52 cloud</Text>
            </Box>
            <Box>
              <Text color="cyan">Conflicts: </Text>
              <Text color="yellow">3 files</Text>
            </Box>
          </Box>
        </Panel>

        <Panel title="Storage Usage" color="magenta" width={40}>
          <Box flexDirection="column" gap={1}>
            <Box>
              <Text color="magenta">Used: </Text>
              <Text>127 MB / 1 GB</Text>
            </Box>
            <Box>
              <Text color="magenta">Components: </Text>
              <Text>89 files</Text>
            </Box>
            <Box>
              <Text color="magenta">Templates: </Text>
              <Text>12 files</Text>
            </Box>
            <Box>
              <Text color="magenta">Settings: </Text>
              <Text>3 files</Text>
            </Box>
          </Box>
        </Panel>
      </Box>

      {action === 'idle' && (
        <Panel title="Sync Options" color="green">
          <Box flexDirection="column" gap={1}>
            <Text>Choose sync action:</Text>
            <Box marginTop={1}>
              <Select
                options={syncOptions.map(opt => ({
                  label: `${opt.label} - ${opt.description}`,
                  value: opt.value
                }))}
                onChange={handleSync}
              />
            </Box>
          </Box>
        </Panel>
      )}

      {action !== 'idle' && (
        <Panel title="Syncing..." color="yellow">
          <Box flexDirection="column" gap={1}>
            {action === 'push' && (
              <>
                <Box><Spinner /> Scanning local components...</Box>
                <Box><Spinner /> Uploading to R2 storage...</Box>
                <Box><Spinner /> Updating cloud index...</Box>
              </>
            )}
            {action === 'pull' && (
              <>
                <Box><Spinner /> Fetching cloud components...</Box>
                <Box><Spinner /> Downloading updates...</Box>
                <Box><Spinner /> Merging with local files...</Box>
              </>
            )}
            {action === 'sync' && (
              <>
                <Box><Spinner /> Analyzing differences...</Box>
                <Box><Spinner /> Resolving conflicts...</Box>
                <Box><Spinner /> Synchronizing changes...</Box>
              </>
            )}
          </Box>
        </Panel>
      )}

      <Panel title="Recent Activity" color="blue">
        <Box flexDirection="column" gap={1}>
          <Text color="gray">• Pushed FormFactory.tsx (2 hours ago)</Text>
          <Text color="gray">• Pulled DashboardTemplate.vue (5 hours ago)</Text>
          <Text color="gray">• Synced settings.json (1 day ago)</Text>
          <Text color="gray">• Resolved conflict in TableFactory.ts (2 days ago)</Text>
        </Box>
      </Panel>

      <Footer showHelp={true} />
    </Box>
  );
};