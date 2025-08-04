import React from 'react';
import { useFeatureAccess } from '../../hooks/useFeatureAccess';
import { FeatureFlag } from '../../../../src/types/subscription';
import { Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface FeatureGateProps {
  feature: FeatureFlag;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
  blurContent?: boolean;
  customMessage?: string;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  children,
  fallback,
  showUpgradePrompt = true,
  blurContent = false,
  customMessage
}) => {
  const { hasAccess, loading, reason } = useFeatureAccess(feature);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="relative">
        {blurContent && (
          <div className="filter blur-sm pointer-events-none select-none">
            {children}
          </div>
        )}
        
        <div className={`${blurContent ? 'absolute inset-0' : ''} flex items-center justify-center`}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-white mb-2">
              Premium Feature
            </h3>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 text-center mb-4">
              {customMessage || reason || 'This feature requires a higher subscription tier.'}
            </p>
            
            {showUpgradePrompt && (
              <div className="flex justify-center">
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Sparkles className="h-4 w-4" />
                  Upgrade to Unlock
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Convenience components for common features
export const AIGenerationGate: React.FC<Omit<FeatureGateProps, 'feature'>> = (props) => (
  <FeatureGate feature={FeatureFlag.AI_GENERATION} {...props} />
);

export const TeamCollaborationGate: React.FC<Omit<FeatureGateProps, 'feature'>> = (props) => (
  <FeatureGate feature={FeatureFlag.TEAM_COLLABORATION} {...props} />
);

export const AdvancedAnalyticsGate: React.FC<Omit<FeatureGateProps, 'feature'>> = (props) => (
  <FeatureGate feature={FeatureFlag.ADVANCED_ANALYTICS} {...props} />
);

export const CustomAITrainingGate: React.FC<Omit<FeatureGateProps, 'feature'>> = (props) => (
  <FeatureGate feature={FeatureFlag.CUSTOM_AI_TRAINING} {...props} />
);