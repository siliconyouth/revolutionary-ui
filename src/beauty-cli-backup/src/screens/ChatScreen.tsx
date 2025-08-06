import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import { Panel } from '../components/Panel.js';
import { TextInput, Spinner } from '@inkjs/ui';
import figures from 'figures';

interface ChatScreenProps {
  onBack: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI coding assistant. I can help you with:\n• Component generation\n• Code optimization\n• Best practices\n• Debugging\n• Architecture decisions\n\nWhat would you like help with?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  useInput((input, key) => {
    if (key.escape && !isTyping) {
      onBack();
    }
  });

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        'I can help you create a form component using the FormFactory pattern. This would reduce your code by approximately 75%. Would you like me to generate it?',
        'Based on your project structure, I recommend using the TableFactory for your data display needs. It supports sorting, filtering, and pagination out of the box.',
        'For optimal performance, consider implementing lazy loading with React.lazy() and Suspense boundaries. This can improve your initial load time by 40%.',
        'The Revolutionary UI factory system can generate that component for you. Try running: revui generate dashboard --name=Analytics --framework=react',
        'I notice you\'re using React with TypeScript. The FormFactory pattern would be perfect here. It provides full type safety and reduces boilerplate by 80%.'
      ];

      const aiMessage: Message = {
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsThinking(false);
    }, 1500);
  };

  return (
    <Box flexDirection="column">
      <Header 
        title="AI Assistant" 
        subtitle="Powered by GPT-4, Claude, and Gemini"
      />

      <Panel title="Chat" color="cyan">
        <Box flexDirection="column" height={15} overflow="hidden">
          {messages.slice(-5).map((message, index) => (
            <Box key={index} marginBottom={1}>
              <Box>
                <Text color={message.role === 'user' ? 'yellow' : 'green'} bold>
                  {message.role === 'user' ? 'You' : 'AI'}:
                </Text>
              </Box>
              <Box marginLeft={2} width={60}>
                <Text wrap="wrap">{message.content}</Text>
              </Box>
            </Box>
          ))}
          {isThinking && (
            <Box>
              <Text color="green" bold>AI: </Text>
              <Spinner />
              <Text color="gray"> Thinking...</Text>
            </Box>
          )}
        </Box>
      </Panel>

      <Panel title="Your Message" color="magenta">
        <Box>
          <Text>{figures.pointer} </Text>
          <TextInput
            defaultValue={input}
            onChange={setInput}
            onSubmit={handleSend}
            placeholder="Ask me anything about coding..."
          />
        </Box>
      </Panel>

      <Box marginTop={1}>
        <Text color="gray">{figures.info} Press Enter to send • ESC to go back</Text>
      </Box>

      <Footer showHelp={false} />
    </Box>
  );
};