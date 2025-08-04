import React from 'react';
import { useSubscription } from '../../hooks/useFeatureAccess';
import { 
  AIGenerationsUsage, 
  PrivateComponentsUsage, 
  TeamMembersUsage,
  APICallsUsage,
  StorageUsage
} from './UsageDisplay';
import { TIER_FEATURES } from '../../../../config/tier-features';
import { Crown, Sparkles, Shield, Users, Zap } from 'lucide-react';
import Link from 'next/link';

export const SubscriptionDashboard: React.FC = () => {
  const { tier, features, limits, usage, loading, error } = useSubscription();

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !tier) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          Unable to load subscription information
        </p>
      </div>
    );
  }

  const tierInfo = TIER_FEATURES[tier];
  const tierIcon = {
    beta_tester: <Shield className="h-8 w-8" />,
    early_bird: <Sparkles className="h-8 w-8" />,
    personal: <Zap className="h-8 w-8" />,
    company: <Users className="h-8 w-8" />,
    enterprise: <Crown className="h-8 w-8" />
  }[tier];

  const getTierColor = () => {
    switch (tier) {
      case 'beta_tester': return 'from-gray-500 to-gray-600';
      case 'early_bird': return 'from-blue-500 to-indigo-600';
      case 'personal': return 'from-purple-500 to-pink-600';
      case 'company': return 'from-green-500 to-teal-600';
      case 'enterprise': return 'from-yellow-500 to-orange-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <div className={`bg-gradient-to-r ${getTierColor()} text-white rounded-lg p-6 shadow-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-lg">
              {tierIcon}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{tierInfo.name}</h2>
              <p className="text-white/80">Your current plan</p>
            </div>
          </div>
          <Link
            href="/pricing"
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            Change Plan
          </Link>
        </div>
      </div>

      {/* Usage Overview */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Usage Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <AIGenerationsUsage />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <PrivateComponentsUsage />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <TeamMembersUsage />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <APICallsUsage />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <StorageUsage />
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Your Features
        </h3>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(features).filter(([_, enabled]) => enabled).map(([feature]) => (
              <div key={feature} className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {feature.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upgrade Prompts */}
      {tier !== 'enterprise' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Unlock More Features
          </h3>
          <p className="text-blue-700 dark:text-blue-300 mb-4">
            Upgrade your plan to access advanced features and increase your limits.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            View Upgrade Options
          </Link>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/billing"
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow hover:shadow-md transition-shadow text-center"
          >
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Manage Billing
            </span>
          </Link>
          <Link
            href="/invoices"
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow hover:shadow-md transition-shadow text-center"
          >
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              View Invoices
            </span>
          </Link>
          <Link
            href="/usage/detailed"
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow hover:shadow-md transition-shadow text-center"
          >
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Detailed Usage
            </span>
          </Link>
          <Link
            href="/support"
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow hover:shadow-md transition-shadow text-center"
          >
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Get Support
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};