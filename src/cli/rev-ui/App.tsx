import React, { useState, useEffect } from 'react';
import { Box, Text, useApp, useInput, useFocus } from 'ink';
import BigText from 'ink-big-text';
import Gradient from 'ink-gradient';
import Spinner from 'ink-spinner';
import { MainMenu } from './components/MainMenu.js';
import { ProjectSetup } from './components/ProjectSetup.js';
import { ComponentGenerator } from './components/ComponentGenerator.js';
import { ComponentBrowser } from './components/ComponentBrowser.js';
import { AIAssistant } from './components/AIAssistant.js';
import { Settings } from './components/Settings.js';
import { Analytics } from './components/Analytics.js';
import { DatabaseService } from './services/DatabaseService.js';
import { AIService } from './services/AIService.js';
import { SessionManager } from './services/SessionManager.js';

type Screen = 'welcome' | 'main' | 'setup' | 'generate' | 'browse' | 'settings' | 'analytics';

export const RevolutionaryUI: React.FC = () => {
  const { exit } = useApp();
  const [screen, setScreen] = useState<Screen>('welcome');
  const [loading, setLoading] = useState(true);
  const [aiReady, setAiReady] = useState(false);
  const [dbReady, setDbReady] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);
  const [aiAssistantMessage, setAiAssistantMessage] = useState('');
  const [dimensions, setDimensions] = useState({ width: 80, height: 24 });

  // Initialize services
  useEffect(() => {
    const initialize = async () => {
      try {
        // Get terminal dimensions
        setDimensions({
          width: process.stdout.columns || 80,
          height: process.stdout.rows || 24
        });

        // Initialize session
        const session = await SessionManager.initialize();
        setSessionData(session);

        // Initialize database
        const dbInitialized = await DatabaseService.initialize();
        setDbReady(dbInitialized);

        // Initialize AI
        const aiInitialized = await AIService.initialize();
        setAiReady(aiInitialized);

        // Get AI welcome message
        if (aiInitialized) {
          const welcomeMsg = await AIService.getWelcomeMessage();
          setAiAssistantMessage(welcomeMsg);
        }

        setLoading(false);
        setTimeout(() => setScreen('main'), 2000);
      } catch (error) {
        console.error('Initialization error:', error);
        setLoading(false);
        setAiAssistantMessage('Welcome to Revolutionary UI! Some features may be limited.');
        setTimeout(() => setScreen('main'), 2000);
      }
    };

    initialize();
  }, []);

  // Handle terminal resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: process.stdout.columns || 80,
        height: process.stdout.rows || 24
      });
    };

    process.stdout.on('resize', handleResize);
    return () => {
      process.stdout.off('resize', handleResize);
    };
  }, []);

  // Global keyboard shortcuts
  useInput((input, key) => {
    if (key.escape || (key.ctrl && input === 'c')) {
      if (screen === 'main') {
        exit();
      } else {
        setScreen('main');
      }
    }
  });

  if (screen === 'welcome') {
    return (
      <Box
        width={dimensions.width}
        height={dimensions.height}
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
      >
        <Box marginBottom={2}>
          <Gradient name="rainbow">
            <BigText text="REV UI" font="chrome" />
          </Gradient>
        </Box>
        
        <Box marginBottom={2}>
          <Text color="cyan" bold>
            Revolutionary UI v3.4.1 - AI-Powered Component Generation
          </Text>
        </Box>

        {loading ? (
          <Box>
            <Text color="yellow">
              <Spinner type="dots" /> Initializing services...
            </Text>
          </Box>
        ) : (
          <Box flexDirection="column" alignItems="center">
            <Text color="green">✓ Database: {dbReady ? 'Connected' : 'Offline Mode'}</Text>
            <Text color="green">✓ AI Assistant: {aiReady ? 'Ready' : 'Limited Mode'}</Text>
            <Box marginTop={1}>
              <Text dimColor>Starting...</Text>
            </Box>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box
      width={dimensions.width}
      height={dimensions.height}
      flexDirection="column"
    >
      {/* Header */}
      <Box
        borderStyle="round"
        borderColor="cyan"
        paddingX={2}
        marginBottom={1}
        flexDirection="row"
        justifyContent="space-between"
      >
        <Gradient name="rainbow">
          <Text bold>Revolutionary UI</Text>
        </Gradient>
        <Text dimColor>
          {screen === 'main' ? 'Main Menu' : screen.charAt(0).toUpperCase() + screen.slice(1)}
        </Text>
      </Box>

      {/* AI Assistant Bar */}
      {aiAssistantMessage && (
        <Box
          borderStyle="single"
          borderColor="yellow"
          paddingX={1}
          marginBottom={1}
          minHeight={3}
        >
          <Box marginRight={1}>
            <Text color="yellow">🤖</Text>
          </Box>
          <Text wrap="wrap">{aiAssistantMessage}</Text>
        </Box>
      )}

      {/* Main Content Area */}
      <Box flexGrow={1} flexDirection="column">
        {screen === 'main' && (
          <MainMenu
            onSelect={(option) => {
              setScreen(option as Screen);
              AIService.getContextualHelp(option).then(setAiAssistantMessage);
            }}
            dbReady={dbReady}
            aiReady={aiReady}
          />
        )}
        
        {screen === 'setup' && (
          <ProjectSetup
            onBack={() => setScreen('main')}
            onAIMessage={setAiAssistantMessage}
          />
        )}
        
        {screen === 'generate' && (
          <ComponentGenerator
            onBack={() => setScreen('main')}
            onAIMessage={setAiAssistantMessage}
          />
        )}
        
        {screen === 'browse' && (
          <ComponentBrowser
            onBack={() => setScreen('main')}
            onAIMessage={setAiAssistantMessage}
          />
        )}
        
        {screen === 'settings' && (
          <Settings
            onBack={() => setScreen('main')}
            onAIMessage={setAiAssistantMessage}
          />
        )}
        
        {screen === 'analytics' && (
          <Analytics
            onBack={() => setScreen('main')}
            sessionData={sessionData}
          />
        )}
      </Box>

      {/* Footer */}
      <Box
        borderStyle="single"
        borderColor="gray"
        paddingX={1}
        justifyContent="center"
      >
        <Text dimColor>
          ESC: Back • ↑↓: Navigate • Enter: Select • Ctrl+C: Exit
        </Text>
      </Box>
    </Box>
  );
};