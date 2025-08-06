import React from 'react';
import { Box, Text, useInput } from 'ink';
import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import { Panel } from '../components/Panel.js';
import Gradient from 'ink-gradient';
import { Badge } from '@inkjs/ui';
import figures from 'figures';

interface AboutScreenProps {
  onBack: () => void;
}

export const AboutScreen: React.FC<AboutScreenProps> = ({ onBack }) => {
  useInput((input, key) => {
    if (key.escape) {
      onBack();
    }
  });

  return (
    <Box flexDirection="column">
      <Header 
        title="About Revolutionary UI" 
        subtitle="AI-Powered Component Generation Factory System"
      />
      
      <Box flexDirection="column" marginY={1} alignItems="center">
        <Gradient name="rainbow">
          <Text bold>🚀 Revolutionary UI v3.4.1 🚀</Text>
        </Gradient>
      </Box>

      <Panel title="Features" color="cyan">
        <Box flexDirection="column" gap={1}>
          <Box>
            <Text color="green">{figures.tick}</Text>
            <Text> 150+ Component Factories with 60-95% code reduction</Text>
          </Box>
          <Box>
            <Text color="green">{figures.tick}</Text>
            <Text> AI-Powered generation (GPT-4, Claude, Gemini)</Text>
          </Box>
          <Box>
            <Text color="green">{figures.tick}</Text>
            <Text> 10,000+ components cataloged with semantic search</Text>
          </Box>
          <Box>
            <Text color="green">{figures.tick}</Text>
            <Text> Full marketplace with Stripe payments</Text>
          </Box>
          <Box>
            <Text color="green">{figures.tick}</Text>
            <Text> 50+ framework support (React, Vue, Angular, etc.)</Text>
          </Box>
          <Box>
            <Text color="green">{figures.tick}</Text>
            <Text> Cloud sync with Cloudflare R2 storage</Text>
          </Box>
        </Box>
      </Panel>

      <Panel title="Technologies" color="magenta">
        <Box flexDirection="row" flexWrap="wrap" gap={1}>
          <Badge color="blue">React</Badge>
          <Badge color="cyan">Ink</Badge>
          <Badge color="yellow">TypeScript</Badge>
          <Badge color="green">Node.js</Badge>
          <Badge color="magenta">@inkjs/ui</Badge>
        </Box>
      </Panel>

      <Panel title="Credits" color="green">
        <Box flexDirection="column" gap={1}>
          <Text>Created with {figures.heart} by the Beauty CLI Team</Text>
          <Text color="gray">Built on top of the amazing Ink ecosystem</Text>
          <Box marginTop={1}>
            <Text color="gray">GitHub: </Text>
            <Text color="cyan">github.com/beauty-cli/beauty</Text>
          </Box>
        </Box>
      </Panel>

      <Box marginTop={1} alignItems="center">
        <Text color="gray">Thank you for using Beauty CLI!</Text>
      </Box>
      
      <Footer showHelp={true} />
    </Box>
  );
};