/**
 * React Components for Terminal UI using react-blessed
 */

import React, { useState, useEffect } from 'react';
import blessed from 'blessed';

// Type declarations for react-blessed elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      box: any;
      list: any;
      log: any;
      progressbar: any;
      form: any;
      textbox: any;
      textarea: any;
      checkbox: any;
      radioset: any;
      button: any;
      table: any;
    }
  }
}

interface Theme {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  border: string;
  text: string;
  dim: string;
}

const defaultTheme: Theme = {
  primary: 'cyan',
  secondary: 'magenta',
  success: 'green',
  warning: 'yellow',
  error: 'red',
  border: 'white',
  text: 'white',
  dim: 'gray'
};

// Box Component
export const Box: React.FC<{
  label: string;
  content?: string;
  theme?: Theme;
  top?: string | number;
  left?: string | number;
  width?: string | number;
  height?: string | number;
}> = ({ label, content = '', theme = defaultTheme, ...position }) => {
  return (
    <box
      label={` ${label} `}
      content={content}
      tags={true}
      border={{ type: 'line', fg: theme.border }}
      style={{
        fg: theme.text,
        border: { fg: theme.border },
        label: { fg: theme.primary }
      }}
      scrollable={true}
      alwaysScroll={true}
      scrollbar={{ style: { bg: theme.dim } }}
      keys={true}
      vi={true}
      mouse={true}
      {...position}
    />
  );
};

// List Component
export const List: React.FC<{
  label: string;
  items: string[];
  onSelect?: (index: number) => void;
  theme?: Theme;
  top?: string | number;
  left?: string | number;
  width?: string | number;
  height?: string | number;
}> = ({ label, items, onSelect, theme = defaultTheme, ...position }) => {
  return (
    <list
      label={` ${label} `}
      items={items}
      tags={true}
      border={{ type: 'line', fg: theme.border }}
      style={{
        fg: theme.text,
        border: { fg: theme.border },
        label: { fg: theme.primary },
        selected: { bg: theme.primary, fg: 'black' }
      }}
      scrollable={true}
      alwaysScroll={true}
      scrollbar={{ style: { bg: theme.dim } }}
      keys={true}
      vi={true}
      mouse={true}
      interactive={true}
      onSelect={onSelect ? () => onSelect((this as any).selected) : undefined}
      {...position}
    />
  );
};

// Progress Bar Component
export const ProgressBar: React.FC<{
  label: string;
  percent: number;
  theme?: Theme;
  top?: string | number;
  left?: string | number;
  width?: string | number;
  height?: string | number;
}> = ({ label, percent, theme = defaultTheme, ...position }) => {
  return (
    <progressbar
      label={` ${label} `}
      filled={percent}
      ch='█'
      style={{
        bar: { bg: theme.primary },
        border: { fg: theme.border },
        label: { fg: theme.primary }
      }}
      border={{ type: 'line' }}
      {...position}
    />
  );
};

// Log Component
export const Log: React.FC<{
  label: string;
  logs?: string[];
  theme?: Theme;
  top?: string | number;
  left?: string | number;
  width?: string | number;
  height?: string | number;
}> = ({ label, logs = [], theme = defaultTheme, ...position }) => {
  const [content, setContent] = useState(logs.join('\n'));

  useEffect(() => {
    setContent(logs.join('\n'));
  }, [logs]);

  return (
    <log
      label={` ${label} `}
      content={content}
      tags={true}
      border={{ type: 'line', fg: theme.border }}
      style={{
        fg: theme.text,
        border: { fg: theme.border },
        label: { fg: theme.primary }
      }}
      scrollable={true}
      alwaysScroll={true}
      scrollbar={{ style: { bg: theme.dim } }}
      keys={true}
      vi={true}
      mouse={true}
      {...position}
    />
  );
};

// Form Component
export const Form: React.FC<{
  label: string;
  fields: Array<{
    name: string;
    label: string;
    value?: string;
    type?: 'textbox' | 'textarea' | 'checkbox' | 'radioset';
  }>;
  onSubmit?: (data: Record<string, any>) => void;
  theme?: Theme;
  top?: string | number;
  left?: string | number;
  width?: string | number;
  height?: string | number;
}> = ({ label, fields, onSubmit, theme = defaultTheme, ...position }) => {
  return (
    <form
      label={` ${label} `}
      border={{ type: 'line', fg: theme.border }}
      style={{
        fg: theme.text,
        border: { fg: theme.border },
        label: { fg: theme.primary }
      }}
      keys={true}
      vi={true}
      {...position}
    >
      {fields.map((field, index) => {
        const fieldProps = {
          name: field.name,
          label: field.label,
          top: index * 3,
          left: 0,
          height: field.type === 'textarea' ? 5 : 3,
          inputOnFocus: true,
          style: {
            fg: theme.text,
            focus: { fg: 'black', bg: theme.primary }
          }
        };

        switch (field.type) {
          case 'textarea':
            return <textarea key={field.name} {...fieldProps} />;
          case 'checkbox':
            return <checkbox key={field.name} {...fieldProps} text={field.label} />;
          case 'radioset':
            return <radioset key={field.name} {...fieldProps} />;
          default:
            return <textbox key={field.name} {...fieldProps} value={field.value || ''} />;
        }
      })}
      <button
        content="Submit"
        top={fields.length * 3}
        left={0}
        shrink={true}
        style={{
          fg: 'black',
          bg: theme.success,
          focus: { bg: theme.primary }
        }}
        onPress={() => {
          if (onSubmit) {
            const formData: Record<string, any> = {};
            // Collect form data
            onSubmit(formData);
          }
        }}
      />
    </form>
  );
};

// Layout Component for AI Interactive Mode
export const AIInteractiveLayout: React.FC<{
  title: string;
  guidance: string;
  menuItems: string[];
  selectedIndex: number;
  logs: string[];
  progress?: number;
  theme?: Theme;
  onMenuSelect: (index: number) => void;
  onEscape: () => void;
}> = ({
  title,
  guidance,
  menuItems,
  selectedIndex,
  logs,
  progress = 0,
  theme = defaultTheme,
  onMenuSelect,
  onEscape
}) => {
  const [focused, setFocused] = useState(true);

  return (
    <>
      {/* Header */}
      <box
        label={` ${title} `}
        content={`{center}${title}{/center}\n\n${guidance}`}
        tags={true}
        border={{ type: 'line', fg: theme.border }}
        style={{
          fg: theme.text,
          border: { fg: theme.border },
          label: { fg: theme.primary }
        }}
        top={0}
        left={0}
        width={'100%'}
        height={5}
      />

      {/* Main Menu */}
      <list
        ref={(ref: any) => {
          if (ref && focused) {
            ref.focus();
          }
        }}
        label={` Options `}
        items={menuItems}
        tags={true}
        border={{ type: 'line', fg: theme.border }}
        style={{
          fg: theme.text,
          border: { fg: theme.border },
          label: { fg: theme.primary },
          selected: { bg: theme.primary, fg: 'black' }
        }}
        scrollable={true}
        alwaysScroll={true}
        scrollbar={{ style: { bg: theme.dim } }}
        keys={true}
        vi={true}
        mouse={true}
        interactive={true}
        selected={selectedIndex}
        onSelect={() => {
          const list = this as any;
          if (list && list.selected !== undefined) {
            onMenuSelect(list.selected);
          }
        }}
        top={5}
        left={0}
        width={'50%'}
        height={'60%'}
      />

      {/* Activity Log */}
      <log
        label={` Activity `}
        content={logs.join('\n')}
        tags={true}
        border={{ type: 'line', fg: theme.border }}
        style={{
          fg: theme.text,
          border: { fg: theme.border },
          label: { fg: theme.primary }
        }}
        scrollable={true}
        alwaysScroll={true}
        scrollbar={{ style: { bg: theme.dim } }}
        keys={true}
        vi={true}
        mouse={true}
        top={5}
        left={'50%'}
        width={'50%'}
        height={'60%'}
      />

      {/* Progress Bar */}
      {progress > 0 && (
        <progressbar
          label={` Progress `}
          filled={progress}
          ch='█'
          style={{
            bar: { bg: theme.primary },
            border: { fg: theme.border },
            label: { fg: theme.primary }
          }}
          border={{ type: 'line' }}
          bottom={3}
          left={0}
          width={'100%'}
          height={3}
        />
      )}

      {/* Status Bar */}
      <box
        label={` Status `}
        content="{center}Press ESC to go back | Tab to navigate | Enter to select{/center}"
        tags={true}
        border={{ type: 'line', fg: theme.border }}
        style={{
          fg: theme.text,
          border: { fg: theme.border },
          label: { fg: theme.primary }
        }}
        bottom={0}
        left={0}
        width={'100%'}
        height={3}
      />
    </>
  );
};

// Component Generation Progress View
export const ComponentGenerationView: React.FC<{
  componentName: string;
  framework: string;
  steps: Array<{ name: string; status: 'pending' | 'running' | 'done' | 'error' }>;
  currentStep: number;
  logs: string[];
  code?: string;
  theme?: Theme;
  onBack: () => void;
}> = ({
  componentName,
  framework,
  steps,
  currentStep,
  logs,
  code,
  theme = defaultTheme,
  onBack
}) => {
  const progress = (currentStep / steps.length) * 100;

  return (
    <>
      {/* Header */}
      <Box
        label={`Generating ${componentName}`}
        content={`Framework: ${framework}\nProgress: ${Math.round(progress)}%`}
        theme={theme}
        top={0}
        left={0}
        width={'100%'}
        height={4}
      />

      {/* Steps Progress */}
      <List
        label="Steps"
        items={steps.map((step, i) => {
          const icon = step.status === 'done' ? '✓' : 
                       step.status === 'running' ? '⟳' : 
                       step.status === 'error' ? '✗' : '○';
          const color = step.status === 'done' ? '{green-fg}' : 
                       step.status === 'running' ? '{yellow-fg}' : 
                       step.status === 'error' ? '{red-fg}' : '';
          return `${color}${icon} ${step.name}{/}`;
        })}
        theme={theme}
        top={4}
        left={0}
        width={'30%'}
        height={'50%'}
      />

      {/* Generation Log */}
      <Log
        label="Generation Log"
        logs={logs}
        theme={theme}
        top={4}
        left={'30%'}
        width={'70%'}
        height={'50%'}
      />

      {/* Generated Code Preview */}
      {code && (
        <Box
          label="Generated Code"
          content={code}
          theme={theme}
          top={'55%'}
          left={0}
          width={'100%'}
          height={'40%'}
        />
      )}

      {/* Status Bar */}
      <Box
        label="Controls"
        content="{center}Press ESC to cancel | Press S to save when done{/center}"
        theme={theme}
        bottom={0}
        left={0}
        width={'100%'}
        height={3}
      />
    </>
  );
};

// Analytics Dashboard View
export const AnalyticsDashboard: React.FC<{
  stats: {
    componentsGenerated: number;
    codeReduction: number;
    frameworksUsed: string[];
    topPatterns: Array<{ name: string; count: number }>;
  };
  theme?: Theme;
  onBack: () => void;
}> = ({ stats, theme = defaultTheme, onBack }) => {
  return (
    <>
      {/* Header */}
      <Box
        label="Revolutionary UI Analytics"
        content={`{center}Component Generation Analytics{/center}`}
        theme={theme}
        top={0}
        left={0}
        width={'100%'}
        height={3}
      />

      {/* Stats Overview */}
      <Box
        label="Overview"
        content={[
          `Components Generated: ${stats.componentsGenerated}`,
          `Average Code Reduction: ${stats.codeReduction}%`,
          `Frameworks Used: ${stats.frameworksUsed.length}`
        ].join('\n')}
        theme={theme}
        top={3}
        left={0}
        width={'50%'}
        height={'30%'}
      />

      {/* Top Patterns */}
      <List
        label="Top Patterns"
        items={stats.topPatterns.map(p => `${p.name}: ${p.count} uses`)}
        theme={theme}
        top={3}
        left={'50%'}
        width={'50%'}
        height={'30%'}
      />

      {/* Framework Distribution */}
      <Box
        label="Framework Distribution"
        content={stats.frameworksUsed.map(f => `• ${f}`).join('\n')}
        theme={theme}
        top={'35%'}
        left={0}
        width={'100%'}
        height={'30%'}
      />

      {/* Status Bar */}
      <Box
        label="Controls"
        content="{center}Press ESC to go back | Press E to export data{/center}"
        theme={theme}
        bottom={0}
        left={0}
        width={'100%'}
        height={3}
      />
    </>
  );
};