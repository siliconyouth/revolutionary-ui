import React from 'react';
import { Check, X, Sparkles, Users, Shield, Crown, Zap } from 'lucide-react';

interface TierQuickReferenceProps {
  tier: string;
  onSelect?: () => void;
  isCurrentTier?: boolean;
}

const tierData = {
  beta_tester: {
    icon: <Shield className="h-6 w-6" />,
    color: 'gray',
    highlights: [
      'ALL Personal features FREE',
      'UNLIMITED AI generations',
      'UNLIMITED private components',
      'Advanced analytics',
      'Export to ALL frameworks',
      'Email support',
      'Version control',
      '20GB storage',
      'Beta tester badge'
    ],
    limitations: [
      'No team features',
      'Single user only'
    ]
  },
  early_bird: {
    icon: <Sparkles className="h-6 w-6" />,
    color: 'blue',
    highlights: [
      'ALL Personal features',
      'UNLIMITED AI generations',
      'UNLIMITED private components',
      'Priority support (exclusive)',
      'Early bird pricing locked forever',
      'Export to ALL frameworks',
      'Advanced analytics',
      '20GB storage'
    ],
    limitations: [
      'No team features',
      'No custom requests'
    ]
  },
  personal: {
    icon: <Zap className="h-6 w-6" />,
    color: 'purple',
    highlights: [
      'UNLIMITED AI generations',
      'UNLIMITED private components',
      'Advanced analytics',
      'All framework exports',
      'Email support',
      '2,000 API calls/day'
    ],
    limitations: [
      'Single user only',
      'No team collaboration'
    ]
  },
  company: {
    icon: <Users className="h-6 w-6" />,
    color: 'green',
    highlights: [
      'Everything in Personal',
      'Up to 10 team members',
      'Team collaboration',
      'SSO authentication',
      'Audit logs',
      '5 custom requests/month',
      '10,000 API calls/day'
    ],
    limitations: [
      'Limited to 10 members',
      'No custom AI training'
    ]
  },
  enterprise: {
    icon: <Crown className="h-6 w-6" />,
    color: 'yellow',
    highlights: [
      'UNLIMITED everything',
      'Custom AI training',
      'On-premise deployment',
      'White label options',
      'Dedicated support',
      '99.9% SLA',
      'Custom integrations'
    ],
    limitations: []
  }
};

export const TierQuickReference: React.FC<TierQuickReferenceProps> = ({
  tier,
  onSelect,
  isCurrentTier
}) => {
  const data = tierData[tier as keyof typeof tierData];
  if (!data) return null;

  const getColorClasses = () => {
    const colors = {
      gray: 'border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800',
      blue: 'border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20',
      purple: 'border-purple-300 bg-purple-50 dark:border-purple-600 dark:bg-purple-900/20',
      green: 'border-green-300 bg-green-50 dark:border-green-600 dark:bg-green-900/20',
      yellow: 'border-yellow-300 bg-yellow-50 dark:border-yellow-600 dark:bg-yellow-900/20'
    };
    return colors[data.color as keyof typeof colors];
  };

  const getIconColorClasses = () => {
    const colors = {
      gray: 'text-gray-600 dark:text-gray-400',
      blue: 'text-blue-600 dark:text-blue-400',
      purple: 'text-purple-600 dark:text-purple-400',
      green: 'text-green-600 dark:text-green-400',
      yellow: 'text-yellow-600 dark:text-yellow-400'
    };
    return colors[data.color as keyof typeof colors];
  };

  return (
    <div className={`border-2 rounded-lg p-6 ${getColorClasses()} ${
      isCurrentTier ? 'ring-2 ring-offset-2 ring-blue-500' : ''
    }`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={getIconColorClasses()}>
          {data.icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Quick Overview
        </h3>
      </div>

      <div className="space-y-4">
        {/* Highlights */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            What you get:
          </h4>
          <ul className="space-y-1">
            {data.highlights.map((highlight, index) => (
              <li key={index} className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {highlight}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Limitations */}
        {data.limitations.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Limitations:
            </h4>
            <ul className="space-y-1">
              {data.limitations.map((limitation, index) => (
                <li key={index} className="flex items-start gap-2">
                  <X className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {limitation}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {onSelect && (
        <button
          onClick={onSelect}
          disabled={isCurrentTier}
          className={`mt-4 w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            isCurrentTier
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
          }`}
        >
          {isCurrentTier ? 'Current Plan' : 'Select This Plan'}
        </button>
      )}
    </div>
  );
};