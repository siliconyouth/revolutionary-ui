import React, { useState } from 'react';
import { Check, X, Sparkles } from 'lucide-react';
import { PRICING_TIERS, pricingHelpers } from '../../../../config/pricing-tiers';

interface PricingPageProps {
  currentTier?: string;
  onSelectTier?: (tierId: string, billingPeriod: 'monthly' | 'yearly') => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ 
  currentTier, 
  onSelectTier 
}) => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const handleSelectTier = (tierId: string) => {
    if (onSelectTier) {
      onSelectTier(tierId, billingPeriod);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Start free, upgrade when you need more power
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-lg ${billingPeriod === 'monthly' ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
              className="relative inline-flex h-8 w-14 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-blue-600 transition-transform ${
                  billingPeriod === 'yearly' ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-lg ${billingPeriod === 'yearly' ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-500'}`}>
              Yearly
            </span>
            <span className="ml-2 inline-flex items-center rounded-full bg-green-100 dark:bg-green-900 px-3 py-1 text-sm font-medium text-green-800 dark:text-green-200">
              Save 30%
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
          {Object.values(PRICING_TIERS).map((tier) => {
            const price = billingPeriod === 'monthly' ? tier.prices.monthly : tier.prices.yearly;
            const monthlyEquivalent = billingPeriod === 'yearly' ? Math.floor(tier.prices.yearly / 12) : tier.prices.monthly;
            const isCurrentTier = currentTier === tier.id;
            const isFree = price === 0;

            return (
              <div
                key={tier.id}
                className={`relative rounded-2xl p-6 ${
                  tier.highlighted
                    ? 'bg-gradient-to-b from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 ring-2 ring-blue-500'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                } ${isCurrentTier ? 'ring-2 ring-green-500' : ''}`}
              >
                {/* Badge */}
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white">
                      {tier.badge}
                    </span>
                  </div>
                )}

                {/* Current Plan Indicator */}
                {isCurrentTier && (
                  <div className="absolute -top-3 right-4">
                    <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900 px-3 py-1 text-xs font-medium text-green-800 dark:text-green-200">
                      Current Plan
                    </span>
                  </div>
                )}

                {/* Tier Name */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {tier.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  {tier.description}
                </p>

                {/* Price */}
                <div className="mb-6">
                  {isFree ? (
                    <div className="text-4xl font-bold text-gray-900 dark:text-white">
                      Free
                    </div>
                  ) : (
                    <>
                      <div className="text-4xl font-bold text-gray-900 dark:text-white">
                        {pricingHelpers.formatPrice(monthlyEquivalent)}
                        <span className="text-lg font-normal text-gray-600 dark:text-gray-300">
                          /mo
                        </span>
                      </div>
                      {billingPeriod === 'yearly' && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {pricingHelpers.formatPrice(price)} billed yearly
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleSelectTier(tier.id)}
                  disabled={tier.disabled || isCurrentTier}
                  className={`w-full rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                    isCurrentTier
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                      : tier.highlighted
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                  } ${tier.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isCurrentTier ? 'Current Plan' : tier.cta}
                </button>

                {/* Features */}
                <div className="mt-6 space-y-3">
                  {tier.features.slice(0, 8).map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      {feature.included ? (
                        <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                      ) : feature.value ? (
                        <span className="h-5 w-5 flex-shrink-0 text-center text-xs font-bold text-blue-600 dark:text-blue-400">
                          {feature.value}
                        </span>
                      ) : (
                        <X className="h-5 w-5 flex-shrink-0 text-gray-400" />
                      )}
                      <span className={`text-sm ${
                        feature.included || feature.value
                          ? 'text-gray-700 dark:text-gray-200'
                          : 'text-gray-400 dark:text-gray-500 line-through'
                      } ${feature.highlight ? 'font-semibold text-blue-600 dark:text-blue-400' : ''}`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Contact Sales */}
                {tier.contactSales && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Need a custom plan?{' '}
                      <a href="/contact" className="text-blue-600 hover:underline">
                        Contact sales
                      </a>
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Comparison Table */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Compare All Features
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <thead>
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-900 dark:text-white border-b dark:border-gray-700">
                    Features
                  </th>
                  {Object.values(PRICING_TIERS).map((tier) => (
                    <th key={tier.id} className="text-center p-4 font-semibold text-gray-900 dark:text-white border-b dark:border-gray-700">
                      {tier.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-4 text-gray-700 dark:text-gray-300 border-b dark:border-gray-700">
                    Price
                  </td>
                  {Object.values(PRICING_TIERS).map((tier) => (
                    <td key={tier.id} className="text-center p-4 font-semibold text-gray-900 dark:text-white border-b dark:border-gray-700">
                      {tier.prices.monthly === 0 
                        ? 'Free' 
                        : `${pricingHelpers.formatPrice(tier.prices.monthly)}/mo`
                      }
                    </td>
                  ))}
                </tr>
                {/* Add more comparison rows here */}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto text-left space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Can I change plans later?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate any charges.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                We accept all major credit cards (Visa, Mastercard, American Express) and PayPal. Enterprise customers can also pay by invoice.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Yes! Start with our free Beta Tester plan to explore all core features. No credit card required.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};