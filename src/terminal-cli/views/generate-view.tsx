/**
 * Generate Component View
 */

import React, { useState, useEffect } from 'react';
import { AppContext } from '../terminal-app';

interface Props {
  context: AppContext;
}

export const GenerateView: React.FC<Props> = ({ context }) => {
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState({
    name: '',
    type: '',
    framework: 'react',
    description: ''
  });

  const steps = [
    'Component Name',
    'Component Type',
    'Select Framework',
    'Describe Features',
    'Generate with AI'
  ];

  useEffect(() => {
    const handleKey = (ch: string, key: any) => {
      if (!key) return;
      
      if (key.name === 'escape') {
        context.navigate('main');
      } else if (key.name === 'return' || key.name === 'enter') {
        if (step < steps.length - 1) {
          setStep(prev => prev + 1);
          context.addLog(`Completed: ${steps[step]}`);
        } else {
          generateComponent();
        }
      } else if (key.name === 'backspace' && step > 0) {
        setStep(prev => prev - 1);
      }
    };

    context.screen.on('keypress', handleKey);
    return () => {
      context.screen.off('keypress', handleKey);
    };
  }, [step, context]);

  const generateComponent = async () => {
    context.addLog('Starting AI generation...');
    try {
      // Simulate generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      context.addLog('Component generated successfully!');
      setTimeout(() => context.navigate('main'), 1500);
    } catch (error) {
      context.addLog('Generation failed: ' + (error as Error).message);
    }
  };

  return (
    <>
      {/* Steps Progress */}
      <box
        top={4}
        left={0}
        width="30%"
        height="70%"
        border={{ type: 'line' }}
        style={{ border: { fg: 'cyan' } }}
        label=" Generation Steps "
      >
        {steps.map((s, i) => {
          const icon = i < step ? '✓' : i === step ? '▶' : '○';
          const color = i < step ? '{green-fg}' : i === step ? '{yellow-fg}' : '';
          return `${color}${icon} ${s}{/}`;
        }).join('\n')}
      </box>

      {/* Configuration Form */}
      <box
        top={4}
        left="30%"
        width="40%"
        height="70%"
        border={{ type: 'line' }}
        style={{ border: { fg: 'cyan' } }}
        label={` ${steps[step]} `}
      >
        {'{center}Step ' + (step + 1) + ' of ' + steps.length + '{/center}\n\n'}
        {step === 0 && 'Enter component name:\n\n(Press Enter to continue)'}
        {step === 1 && 'Select component type:\n\n1. Form\n2. Table\n3. Dashboard\n4. Chart'}
        {step === 2 && 'Select framework:\n\n1. React\n2. Vue\n3. Angular\n4. Svelte'}
        {step === 3 && 'Describe what your component should do:\n\n(Press Enter to continue)'}
        {step === 4 && 'Ready to generate!\n\nPress Enter to start AI generation'}
      </box>

      {/* Generation Log */}
      <box
        top={4}
        left="70%"
        width="30%"
        height="70%"
        border={{ type: 'line' }}
        style={{ border: { fg: 'cyan' } }}
        label=" Generation Log "
        scrollable={true}
      >
        {context.logs.slice(-20).join('\n')}
      </box>
    </>
  );
};