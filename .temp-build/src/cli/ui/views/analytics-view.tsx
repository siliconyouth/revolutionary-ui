/**
 * Analytics Dashboard View for Terminal UI
 */

import React, { useState, useEffect } from 'react';

interface AnalyticsViewProps {
  onBack: () => void;
  addLog: (message: string) => void;
}

interface AnalyticsData {
  componentsGenerated: number;
  codeReduction: number;
  timesSaved: number;
  topPatterns: Array<{ name: string; count: number; percentage: number }>;
  recentActivity: Array<{ timestamp: string; action: string; details: string }>;
  frameworkUsage: Array<{ name: string; count: number }>;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ 
  onBack, 
  addLog 
}) => {
  const [analytics] = useState<AnalyticsData>({
    componentsGenerated: 1247,
    codeReduction: 73,
    timesSaved: 892,
    topPatterns: [
      { name: 'Form Factory', count: 342, percentage: 27.4 },
      { name: 'Table Factory', count: 289, percentage: 23.2 },
      { name: 'Dashboard Factory', count: 198, percentage: 15.9 },
      { name: 'Chart Factory', count: 156, percentage: 12.5 },
      { name: 'Auth Factory', count: 134, percentage: 10.7 },
      { name: 'Modal Factory', count: 128, percentage: 10.3 }
    ],
    recentActivity: [
      { timestamp: '10:45 AM', action: 'Generated', details: 'UserDashboard component' },
      { timestamp: '10:32 AM', action: 'Analyzed', details: 'Project structure' },
      { timestamp: '10:15 AM', action: 'Generated', details: 'DataTable with sorting' },
      { timestamp: '09:58 AM', action: 'Optimized', details: 'Form validation logic' },
      { timestamp: '09:42 AM', action: 'Generated', details: 'Authentication flow' }
    ],
    frameworkUsage: [
      { name: 'React', count: 745 },
      { name: 'Vue', count: 312 },
      { name: 'Angular', count: 98 },
      { name: 'Svelte', count: 92 }
    ]
  });

  const [selectedTab, setSelectedTab] = useState<'overview' | 'patterns' | 'activity'>('overview');

  useEffect(() => {
    addLog('Analytics data loaded');
  }, []);

  const formatNumber = (num: number) => num.toLocaleString();

  const renderProgressBar = (percentage: number, width: number = 20) => {
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    return `{green-fg}${'█'.repeat(filled)}{/green-fg}{gray-fg}${'░'.repeat(empty)}{/gray-fg}`;
  };

  return (
    <>
      {/* Tab Navigation */}
      <box
        top={4}
        left={0}
        width="100%"
        height={3}
        border={{ type: 'line' }}
        style={{
          border: { fg: 'cyan' }
        }}
      >
        <text
          content={`{center}${
            ['overview', 'patterns', 'activity'].map(tab => 
              tab === selectedTab ? `{yellow-bg}{black-fg} ${tab.toUpperCase()} {/black-fg}{/yellow-bg}` : ` ${tab.toUpperCase()} `
            ).join('  ')
          }{/center}`}
          tags={true}
        />
      </box>

      {selectedTab === 'overview' && (
        <>
          {/* Key Metrics */}
          <box
            top={7}
            left={0}
            width="33%"
            height={8}
            border={{ type: 'line' }}
            style={{
              border: { fg: 'cyan' },
              label: { fg: 'magenta' }
            }}
            label=" Components Generated "
            content={`
{center}{bold}{yellow-fg}${formatNumber(analytics.componentsGenerated)}{/yellow-fg}{/bold}{/center}
{center}Total Components{/center}

{green-fg}+23%{/green-fg} from last month
            `}
            tags={true}
          />

          <box
            top={7}
            left="33%"
            width="34%"
            height={8}
            border={{ type: 'line' }}
            style={{
              border: { fg: 'cyan' },
              label: { fg: 'magenta' }
            }}
            label=" Code Reduction "
            content={`
{center}{bold}{green-fg}${analytics.codeReduction}%{/green-fg}{/bold}{/center}
{center}Average Reduction{/center}

60-95% range achieved
            `}
            tags={true}
          />

          <box
            top={7}
            left="67%"
            width="33%"
            height={8}
            border={{ type: 'line' }}
            style={{
              border: { fg: 'cyan' },
              label: { fg: 'magenta' }
            }}
            label=" Time Saved "
            content={`
{center}{bold}{cyan-fg}${formatNumber(analytics.timesSaved)}{/cyan-fg}{/bold}{/center}
{center}Hours Saved{/center}

~37 days of work
            `}
            tags={true}
          />

          {/* Framework Usage */}
          <box
            top={15}
            left={0}
            width="50%"
            height={12}
            border={{ type: 'line' }}
            style={{
              border: { fg: 'cyan' },
              label: { fg: 'magenta' }
            }}
            label=" Framework Usage "
            content={analytics.frameworkUsage.map(fw => {
              const percentage = (fw.count / analytics.componentsGenerated) * 100;
              return `${fw.name.padEnd(10)} ${renderProgressBar(percentage)} ${percentage.toFixed(1)}%`;
            }).join('\n')}
            tags={true}
          />

          {/* Performance Trend */}
          <box
            top={15}
            left="50%"
            width="50%"
            height={12}
            border={{ type: 'line' }}
            style={{
              border: { fg: 'cyan' },
              label: { fg: 'magenta' }
            }}
            label=" Code Reduction Trend "
            content={`
{yellow-fg}Month    Reduction   Trend{/yellow-fg}
{gray-fg}━━━━━━━━━━━━━━━━━━━━━━━━━━━━{/gray-fg}
Jan      65%         {green-fg}▲{/green-fg}
Feb      68%         {green-fg}▲{/green-fg}
Mar      70%         {green-fg}▲{/green-fg}
Apr      71%         {green-fg}▲{/green-fg}
May      73%         {green-fg}▲▲{/green-fg}

{gray-fg}Revolutionary UI continuously improves!{/gray-fg}
            `}
            tags={true}
          />
        </>
      )}

      {selectedTab === 'patterns' && (
        <>
          <box
            top={7}
            left={0}
            width="100%"
            height="63%"
            border={{ type: 'line' }}
            style={{
              border: { fg: 'cyan' },
              label: { fg: 'magenta' }
            }}
            label=" Top Factory Patterns "
            content={`
{yellow-fg}Pattern              Usage    Percentage    Visual{/yellow-fg}
{gray-fg}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{/gray-fg}
${analytics.topPatterns.map(pattern => 
  `${pattern.name.padEnd(18)} ${pattern.count.toString().padStart(5)} ${pattern.percentage.toFixed(1).padStart(10)}%    ${renderProgressBar(pattern.percentage, 25)}`
).join('\n')}

{gray-fg}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{/gray-fg}
{bold}Total Patterns: ${analytics.topPatterns.reduce((sum, p) => sum + p.count, 0)}{/bold}
            `}
            tags={true}
            scrollable={true}
          />
        </>
      )}

      {selectedTab === 'activity' && (
        <>
          <box
            top={7}
            left={0}
            width="100%"
            height="63%"
            border={{ type: 'line' }}
            style={{
              border: { fg: 'cyan' },
              label: { fg: 'magenta' }
            }}
            label=" Recent Activity "
            content={`
{yellow-fg}Time        Action       Details{/yellow-fg}
{gray-fg}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{/gray-fg}
${analytics.recentActivity.map(activity => 
  `${activity.timestamp.padEnd(10)} ${activity.action.padEnd(11)} ${activity.details}`
).join('\n')}
            `}
            tags={true}
            scrollable={true}
          />
        </>
      )}

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
        content="{center}←→: Switch Tabs | ↑↓: Scroll | ESC: Back to Menu{/center}"
        tags={true}
      />
    </>
  );
};