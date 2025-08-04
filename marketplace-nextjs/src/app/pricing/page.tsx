'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { SUBSCRIPTION_PLANS } from '@/lib/stripe/plans'
import { FiCheck, FiX } from 'react-icons/fi'
import { loadStripe } from '@stripe/stripe-js'
import Navigation from '@/components/SimpleNavigation'
import Link from 'next/link'

export default function PricingPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState<string | null>(null)
  const [currentPlan, setCurrentPlan] = useState<string>('free')
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      loadSubscription()
    }
  }, [user])

  const loadSubscription = async () => {
    const { data } = await supabase
      .from('user_subscriptions')
      .select('plan')
      .eq('user_id', user!.id)
      .single()
    
    if (data) {
      setCurrentPlan(data.plan)
    }
  }

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      router.push('/auth/signin?redirect=/pricing')
      return
    }

    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId)
    if (!plan || !plan.prices[billingInterval]?.priceId) {
      alert('This plan is not available for subscription')
      return
    }

    setLoading(planId)

    try {
      // Create checkout session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.prices[billingInterval].priceId,
          userId: user.id,
          userEmail: user.email,
        }),
      })

      const { sessionId, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      // Redirect to Stripe checkout
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
      const { error: stripeError } = await stripe!.redirectToCheckout({ sessionId })

      if (stripeError) {
        throw stripeError
      }
    } catch (error: any) {
      console.error('Subscription error:', error)
      alert('Failed to start subscription: ' + error.message)
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-purple-50 via-white to-blue-50 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob"></div>
          <div className="absolute top-40 left-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-10 right-40 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-purple-100 rounded-full mb-6">
            <span className="text-purple-600 font-medium text-sm">💸 Simple, transparent pricing</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Pricing that scales with
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
              your success
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            Start free and upgrade as you grow. No hidden fees, no surprises. 
            Just powerful UI generation at fair prices.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-white rounded-full shadow-lg p-1">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                billingInterval === 'monthly'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly billing
            </button>
            <button
              onClick={() => setBillingInterval('yearly')}
              className={`px-6 py-3 rounded-full font-medium transition-all flex items-center gap-2 ${
                billingInterval === 'yearly'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Annual billing
              <span className={`px-2 py-1 text-xs rounded-full ${
                billingInterval === 'yearly' ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'
              }`}>
                Save 17%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="-mt-8 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {SUBSCRIPTION_PLANS.map((plan) => {
              const price = plan.prices[billingInterval]
              const isCurrentPlan = currentPlan === plan.id

              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-2xl overflow-hidden transition-all hover:shadow-xl ${
                    plan.highlighted
                      ? 'ring-2 ring-purple-600 shadow-xl transform scale-105'
                      : 'shadow-lg border border-gray-100'
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-600 to-blue-600"></div>
                  )}
                  {plan.highlighted && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      MOST POPULAR
                    </div>
                  )}

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                      {plan.description}
                    </p>

                    <div className="mb-6">
                      {price?.amount === 0 ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold text-gray-900">$0</span>
                          <span className="text-gray-600">/forever</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold text-gray-900">
                              ${price?.amount}
                            </span>
                            <span className="text-gray-600">
                              /{billingInterval === 'monthly' ? 'month' : 'year'}
                            </span>
                          </div>
                          {billingInterval === 'yearly' && plan.prices.monthly && price && (
                            <div className="text-sm text-gray-500 mt-1">
                              ${(price.amount / 12).toFixed(2)} per month
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* CTA Button */}
                    {isCurrentPlan ? (
                      <button
                        disabled
                        className="w-full py-3 px-4 bg-gray-100 text-gray-600 rounded-xl font-semibold cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Current Plan
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={loading === plan.id}
                        className={`w-full py-3 px-4 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                          plan.highlighted
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg'
                            : 'bg-gray-900 hover:bg-gray-800 text-white'
                        } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                      >
                        {loading === plan.id ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Processing...
                          </span>
                        ) : price?.amount === 0 ? (
                          'Start Free'
                        ) : (
                          'Get Started'
                        )}
                      </button>
                    )}
                  </div>

                  {/* Features */}
                  <div className="px-6 pb-6">
                    <div className="border-t pt-6">
                      <ul className="space-y-3">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                              <FiCheck className="w-3 h-3 text-green-600" />
                            </div>
                            <span className="text-sm text-gray-700 leading-relaxed">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Detailed Feature Comparison
            </h2>
            <p className="text-lg text-gray-600">
              See exactly what's included in each plan
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">
                      Features
                    </th>
                    {SUBSCRIPTION_PLANS.map((plan) => (
                      <th
                        key={plan.id}
                        className="text-center py-4 px-6 font-semibold text-gray-900"
                      >
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-gray-700 font-medium">
                      Components per month
                    </td>
                    {SUBSCRIPTION_PLANS.map((plan) => (
                      <td key={plan.id} className="text-center py-4 px-6">
                        <span className={`font-semibold ${
                          plan.limits.componentsPerMonth === -1 ? 'text-purple-600' : 'text-gray-900'
                        }`}>
                          {plan.limits.componentsPerMonth === -1
                            ? '∞ Unlimited'
                            : plan.limits.componentsPerMonth}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-gray-700 font-medium">AI Providers</td>
                    {SUBSCRIPTION_PLANS.map((plan) => (
                      <td key={plan.id} className="text-center py-4 px-6">
                        <span className={`font-semibold ${
                          plan.limits.aiProvidersPerMonth === -1 ? 'text-purple-600' : 'text-gray-900'
                        }`}>
                          {plan.limits.aiProvidersPerMonth === -1
                            ? 'All Providers'
                            : plan.limits.aiProvidersPerMonth === 1
                            ? 'OpenAI only'
                            : plan.limits.aiProvidersPerMonth}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-gray-700 font-medium">
                      Custom AI Providers
                    </td>
                    {SUBSCRIPTION_PLANS.map((plan) => (
                      <td key={plan.id} className="text-center py-4 px-6">
                        <span className={`font-semibold ${
                          plan.limits.customProviders === -1 ? 'text-purple-600' : 'text-gray-900'
                        }`}>
                          {plan.limits.customProviders === -1
                            ? '∞ Unlimited'
                            : plan.limits.customProviders}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-gray-700 font-medium">Team Members</td>
                    {SUBSCRIPTION_PLANS.map((plan) => (
                      <td key={plan.id} className="text-center py-4 px-6">
                        <span className={`font-semibold ${
                          plan.limits.teamMembers === -1 ? 'text-purple-600' : 'text-gray-900'
                        }`}>
                          {plan.limits.teamMembers === -1
                            ? '∞ Unlimited'
                            : plan.limits.teamMembers}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-gray-700 font-medium">Priority Support</td>
                    {SUBSCRIPTION_PLANS.map((plan) => (
                      <td key={plan.id} className="text-center py-4 px-6">
                        {plan.limits.prioritySupport ? (
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <FiCheck className="w-4 h-4 text-green-600" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                            <FiX className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-gray-700 font-medium">
                      Custom Integrations
                    </td>
                    {SUBSCRIPTION_PLANS.map((plan) => (
                      <td key={plan.id} className="text-center py-4 px-6">
                        {plan.limits.customIntegrations ? (
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <FiCheck className="w-4 h-4 text-green-600" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                            <FiX className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-gray-700 font-medium">99.9% SLA</td>
                    {SUBSCRIPTION_PLANS.map((plan) => (
                      <td key={plan.id} className="text-center py-4 px-6">
                        {plan.limits.sla ? (
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <FiCheck className="w-4 h-4 text-green-600" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                            <FiX className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to know about our pricing
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-purple-600">🔄</span>
                Can I change plans anytime?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any differences.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-purple-600">📨</span>
                What happens if I exceed my limits?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                We'll notify you when you're approaching your limits. You can upgrade your plan or wait until the next billing cycle for your limits to reset.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-purple-600">💰</span>
                Do you offer refunds?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                We offer a 14-day money-back guarantee for all paid plans. If you're not satisfied, contact support for a full refund.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-purple-600">🔒</span>
                Is my data secure?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Absolutely. We use industry-standard encryption for all data, including API keys. Your AI provider credentials are encrypted and never exposed.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to revolutionize your UI development?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of developers building faster with Revolutionary UI Factory
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/auth/signup')}
              className="px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105"
            >
              Start Free Trial
            </button>
            <Link
              href="/components"
              className="px-8 py-4 bg-transparent text-white border-2 border-white rounded-xl font-semibold text-lg hover:bg-white/10 transition-all"
            >
              Browse Components
            </Link>
          </div>
        </div>
      </section>
      
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </>
  )
}