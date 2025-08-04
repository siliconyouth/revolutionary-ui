import React, { useState } from 'react';
import { Check, X, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { TIER_FEATURES, FEATURE_CATEGORIES, tierHelpers } from '../../../../config/tier-features';
import { SubscriptionTier, FeatureFlag } from '../../../../src/types/subscription';

interface TierComparisonTableProps {
  currentTier?: string;
  onSelectTier?: (tier: string) => void;
}

export const TierComparisonTable: React.FC<TierComparisonTableProps> = ({
  currentTier,
  onSelectTier
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['core']));
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const renderFeatureValue = (tier: string, feature: string) => {
    const hasFeature = tierHelpers.hasFeature(tier, feature);
    const tierConfig = TIER_FEATURES[tier];
    
    // Special handling for features with values
    if (feature === FeatureFlag.AI_GENERATION) {
      const limit = tierConfig.limits.ai_generations_monthly;
      if (limit === -1) return <span className="text-green-600 font-semibold">Unlimited</span>;
      return <span className="text-blue-600 font-semibold">{limit}/mo</span>;
    }
    
    if (feature === FeatureFlag.PRIVATE_COMPONENTS) {
      const limit = tierConfig.limits.private_components;
      if (!hasFeature) return <X className="h-5 w-5 text-gray-400" />;
      if (limit === -1) return <span className="text-green-600 font-semibold">Unlimited</span>;
      return <span className="text-blue-600 font-semibold">{limit}</span>;
    }
    
    if (feature === FeatureFlag.CUSTOM_COMPONENT_REQUESTS) {
      const limit = tierConfig.limits.custom_component_requests;
      if (!hasFeature) return <X className="h-5 w-5 text-gray-400" />;
      if (limit === -1) return <span className="text-green-600 font-semibold">Unlimited</span>;
      return <span className="text-blue-600 font-semibold">{limit}/mo</span>;
    }
    
    // Default boolean features
    return hasFeature ? (
      <Check className="h-5 w-5 text-green-500" />
    ) : (
      <X className="h-5 w-5 text-gray-400" />
    );
  };

  const renderLimitRow = (
    label: string, 
    getValue: (tier: string) => string | number,
    suffix?: string
  ) => {
    return (
      <tr className="border-t border-gray-200 dark:border-gray-700">
        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
          {label}
        </td>
        {Object.keys(TIER_FEATURES).map(tier => (
          <td key={tier} className="px-4 py-3 text-center">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {getValue(tier) === -1 ? 'Unlimited' : getValue(tier)}
              {getValue(tier) !== -1 && suffix ? suffix : ''}
            </span>
          </td>
        ))}
      </tr>
    );
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Controls */}
        <div className="mb-4 flex justify-between items-center">
          <button
            onClick={() => setShowAllFeatures(!showAllFeatures)}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            {showAllFeatures ? 'Show Less' : 'Show All Features'}
          </button>
          <button
            onClick={() => {
              if (expandedCategories.size === Object.keys(FEATURE_CATEGORIES).length) {
                setExpandedCategories(new Set());
              } else {
                setExpandedCategories(new Set(Object.keys(FEATURE_CATEGORIES)));
              }
            }}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            {expandedCategories.size === Object.keys(FEATURE_CATEGORIES).length 
              ? 'Collapse All' 
              : 'Expand All'
            }
          </button>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-300 dark:border-gray-600">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                Features
              </th>
              {Object.values(TIER_FEATURES).map(tier => (
                <th key={tier.name} className="px-4 py-3 text-center">
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {tier.name}
                  </div>
                  {currentTier === Object.keys(TIER_FEATURES).find(k => TIER_FEATURES[k].name === tier.name) && (
                    <span className="text-xs text-green-600 dark:text-green-400">Current</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Feature Categories */}
            {Object.entries(FEATURE_CATEGORIES).map(([categoryKey, category]) => {
              const isExpanded = expandedCategories.has(categoryKey);
              const visibleFeatures = showAllFeatures 
                ? category.features 
                : category.features.slice(0, 3);
              
              return (
                <React.Fragment key={categoryKey}>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <td 
                      colSpan={6} 
                      className="px-4 py-2 cursor-pointer"
                      onClick={() => toggleCategory(categoryKey)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {category.name}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                    </td>
                  </tr>
                  {isExpanded && visibleFeatures.map(feature => (
                    <tr key={feature} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          {tierHelpers.getFeatureName(feature)}
                          <Info className="h-3 w-3 text-gray-400" />
                        </div>
                      </td>
                      {Object.keys(TIER_FEATURES).map(tier => (
                        <td key={tier} className="px-4 py-3 text-center">
                          {renderFeatureValue(tier, feature)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {isExpanded && !showAllFeatures && category.features.length > 3 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-2 text-center">
                        <button
                          onClick={() => setShowAllFeatures(true)}
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          Show {category.features.length - 3} more features
                        </button>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            
            {/* Resource Limits Section */}
            <tr className="bg-gray-50 dark:bg-gray-800">
              <td colSpan={6} className="px-4 py-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Resource Limits
                </span>
              </td>
            </tr>
            {renderLimitRow('Team Members', (tier) => {
              const limit = TIER_FEATURES[tier].limits.team_members;
              return limit === -1 ? 'Unlimited' : limit;
            })}
            {renderLimitRow('API Calls', (tier) => {
              const limit = TIER_FEATURES[tier].limits.api_calls_daily;
              return limit === -1 ? 'Unlimited' : limit.toLocaleString();
            }, '/day')}
            {renderLimitRow('Storage', (tier) => {
              const limit = TIER_FEATURES[tier].limits.storage_gb;
              return limit === -1 ? 'Unlimited' : limit;
            }, ' GB')}
            {renderLimitRow('Bandwidth', (tier) => {
              const limit = TIER_FEATURES[tier].limits.bandwidth_gb_monthly;
              return limit === -1 ? 'Unlimited' : limit;
            }, ' GB/mo')}
            {renderLimitRow('Concurrent Builds', (tier) => {
              const limit = TIER_FEATURES[tier].limits.concurrent_builds;
              return limit === -1 ? 'Unlimited' : limit;
            })}
            
            {/* Action Row */}
            <tr className="border-t-2 border-gray-300 dark:border-gray-600">
              <td className="px-4 py-4"></td>
              {Object.keys(TIER_FEATURES).map(tier => (
                <td key={tier} className="px-4 py-4 text-center">
                  <button
                    onClick={() => onSelectTier?.(tier)}
                    disabled={currentTier === tier}
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                      currentTier === tier
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {currentTier === tier ? 'Current' : 'Select'}
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};