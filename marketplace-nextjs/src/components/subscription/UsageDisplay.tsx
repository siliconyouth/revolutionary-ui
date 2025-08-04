import React from 'react';
import { useUsageLimit } from '../../hooks/useFeatureAccess';
import { AlertCircle, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';

interface UsageDisplayProps {
  metric: string;
  label?: string;
  showUpgradePrompt?: boolean;
  warningThreshold?: number; // Percentage at which to show warning (default 80)
  className?: string;
  compact?: boolean;
}

export const UsageDisplay: React.FC<UsageDisplayProps> = ({
  metric,
  label,
  showUpgradePrompt = true,
  warningThreshold = 80,
  className = '',
  compact = false
}) => {
  const { current, max, isWithinLimit, percentageUsed, loading, error } = useUsageLimit(metric);

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (error) {
    return null;
  }

  const isUnlimited = max === -1;
  const showWarning = !isUnlimited && percentageUsed >= warningThreshold;
  const showDanger = !isUnlimited && !isWithinLimit;

  const formatMetricLabel = () => {
    if (label) return label;
    return metric.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getProgressColor = () => {
    if (showDanger) return 'bg-red-500';
    if (showWarning) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getTextColor = () => {
    if (showDanger) return 'text-red-600 dark:text-red-400';
    if (showWarning) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-700 dark:text-gray-300';
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className={`text-sm ${getTextColor()}`}>
          {current}{isUnlimited ? '' : `/${max}`}
        </span>
        {showWarning && <AlertCircle className="h-4 w-4 text-yellow-500" />}
        {showDanger && showUpgradePrompt && (
          <Link href="/pricing" className="text-xs text-blue-600 hover:underline">
            Upgrade
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className={`h-4 w-4 ${getTextColor()}`} />
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {formatMetricLabel()}
          </span>
        </div>
        <span className={`text-sm font-semibold ${getTextColor()}`}>
          {current.toLocaleString()}
          {!isUnlimited && ` / ${max.toLocaleString()}`}
          {isUnlimited && <span className="text-green-600 dark:text-green-400"> (Unlimited)</span>}
        </span>
      </div>

      {!isUnlimited && (
        <>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${getProgressColor()}`}
              style={{ width: `${Math.min(percentageUsed, 100)}%` }}
            />
          </div>

          {showWarning && !showDanger && (
            <div className="flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-400">
              <AlertCircle className="h-3 w-3" />
              <span>You've used {Math.round(percentageUsed)}% of your limit</span>
            </div>
          )}

          {showDanger && (
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="h-3 w-3" />
                <span>Limit reached</span>
              </div>
              {showUpgradePrompt && (
                <Link
                  href="/pricing"
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  <TrendingUp className="h-3 w-3" />
                  Upgrade for more
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Convenience components for common metrics
export const AIGenerationsUsage: React.FC<Omit<UsageDisplayProps, 'metric'>> = (props) => (
  <UsageDisplay metric="ai_generations_monthly" label="AI Generations" {...props} />
);

export const PrivateComponentsUsage: React.FC<Omit<UsageDisplayProps, 'metric'>> = (props) => (
  <UsageDisplay metric="private_components" label="Private Components" {...props} />
);

export const TeamMembersUsage: React.FC<Omit<UsageDisplayProps, 'metric'>> = (props) => (
  <UsageDisplay metric="team_members" label="Team Members" {...props} />
);

export const APICallsUsage: React.FC<Omit<UsageDisplayProps, 'metric'>> = (props) => (
  <UsageDisplay metric="api_calls_daily" label="API Calls Today" {...props} />
);

export const StorageUsage: React.FC<Omit<UsageDisplayProps, 'metric'>> = (props) => (
  <UsageDisplay metric="storage_gb" label="Storage" {...props} />
);