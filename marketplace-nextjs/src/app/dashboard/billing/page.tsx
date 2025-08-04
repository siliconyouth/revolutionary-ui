'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiCreditCard, FiCalendar, FiTrendingUp, FiAlertCircle, FiCheck, FiX } from 'react-icons/fi'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface Subscription {
  id: string
  tier: string
  status: string
  billingPeriod: string
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  metadata?: any
}

interface UsageData {
  metric: string
  used: number
  limit: number
  percentage: number
}

interface Invoice {
  id: string
  amount: number
  currency: string
  status: string
  periodStart: Date
  periodEnd: Date
  paidAt?: Date
  metadata?: any
}

const TIER_FEATURES = {
  beta_tester: {
    name: 'Beta Tester',
    price: { monthly: 0, yearly: 0 },
    features: [
      'All Personal features',
      'Unlimited AI generations',
      'Unlimited private components',
      '20GB storage',
      '2,000 API calls daily',
      'All export formats'
    ]
  },
  early_bird: {
    name: 'Early Bird',
    price: { monthly: 9.99, yearly: 83.91 },
    features: [
      'All Personal features',
      'Unlimited AI generations',
      'Unlimited private components',
      '20GB storage',
      '2,000 API calls daily',
      'All export formats'
    ]
  },
  personal: {
    name: 'Personal',
    price: { monthly: 19.99, yearly: 167.91 },
    features: [
      'Unlimited AI generations',
      'Unlimited private components',
      '20GB storage',
      '2,000 API calls daily',
      '200GB bandwidth',
      'All export formats'
    ]
  },
  company: {
    name: 'Company',
    price: { monthly: 49.99, yearly: 419.91 },
    features: [
      'Everything in Personal',
      'Team workspaces',
      '10 team members',
      '100GB storage',
      '10,000 API calls daily',
      '1TB bandwidth',
      'Private registry',
      'CI/CD integration',
      'Webhook support',
      'Priority support'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    price: { monthly: 99.99, yearly: 839.91 },
    features: [
      'Everything in Company',
      'Unlimited team members',
      'Unlimited storage',
      'Unlimited API calls',
      'Unlimited bandwidth',
      'SSO authentication',
      'RBAC',
      'Audit logs',
      'SLA support',
      'Custom contracts'
    ]
  }
}

export default function BillingPage() {
  const router = useRouter()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [usage, setUsage] = useState<UsageData[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [canceling, setCanceling] = useState(false)
  const [upgrading, setUpgrading] = useState(false)

  useEffect(() => {
    loadBillingData()
  }, [])

  const loadBillingData = async () => {
    setLoading(true)
    try {
      // Get current user
      const userRes = await fetch('/api/auth/me')
      const { user } = await userRes.json()
      
      if (!user) {
        router.push('/auth/signin')
        return
      }

      // Load subscription
      const subRes = await fetch('/api/billing/subscription')
      const { subscription: subData } = await subRes.json()
      setSubscription(subData)

      // Load usage
      const usageRes = await fetch('/api/billing/usage')
      const { usage: usageData } = await usageRes.json()
      setUsage(usageData || [])

      // Load invoices
      const invoicesRes = await fetch('/api/billing/invoices')
      const { invoices: invoiceData } = await invoicesRes.json()
      setInvoices(invoiceData || [])

    } catch (error) {
      console.error('Failed to load billing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = (newTier: string) => {
    setUpgrading(true)
    router.push(`/pricing?upgrade=${newTier}&from=${subscription?.tier}`)
  }

  const handleManageSubscription = async () => {
    if (!subscription?.stripeCustomerId) return

    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: subscription.stripeCustomerId,
        }),
      })

      const { url, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      window.location.href = url
    } catch (error: any) {
      console.error('Portal error:', error)
      alert('Failed to open billing portal: ' + error.message)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      return
    }

    setCanceling(true)
    try {
      const response = await fetch('/api/billing/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: subscription?.stripeSubscriptionId,
        }),
      })

      const { success, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      alert('Your subscription has been canceled. You will continue to have access until the end of your billing period.')
      await loadBillingData()
    } catch (error: any) {
      console.error('Cancellation error:', error)
      alert('Failed to cancel subscription: ' + error.message)
    } finally {
      setCanceling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  const currentTier = subscription?.tier || 'personal'
  const tierInfo = TIER_FEATURES[currentTier as keyof typeof TIER_FEATURES]
  const price = subscription?.billingPeriod === 'yearly' 
    ? tierInfo.price.yearly 
    : tierInfo.price.monthly
  
  const daysLeft = subscription 
    ? Math.ceil((new Date(subscription.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
              <h1 className="text-xl font-semibold">Billing & Subscription</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Plan & Usage */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Plan */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Current Plan</h2>
                {currentTier !== 'enterprise' && (
                  <button
                    onClick={() => router.push('/pricing')}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
                  >
                    Upgrade Plan
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FiCreditCard className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {tierInfo.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        ${price}/{subscription?.billingPeriod || 'month'}
                      </p>
                    </div>
                  </div>
                  
                  {subscription?.cancelAtPeriodEnd && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <FiAlertCircle className="inline w-4 h-4 mr-1" />
                        Subscription will end on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Plan Features:</p>
                    <ul className="space-y-2">
                      {tierInfo.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                          <FiCheck className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FiCalendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Billing Period
                      </h3>
                      <p className="text-sm text-gray-600">
                        {daysLeft} days remaining
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {subscription?.billingPeriod === 'yearly' ? 'Annual' : 'Monthly'} billing
                  </p>
                  <p className="text-xs text-gray-500">
                    Renews on {subscription && new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>

                  {/* Quick Actions */}
                  <div className="mt-6 space-y-3">
                    {subscription?.stripeSubscriptionId && (
                      <>
                        <button
                          onClick={handleManageSubscription}
                          className="w-full px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
                        >
                          Manage Payment Method
                        </button>
                        {!subscription.cancelAtPeriodEnd && currentTier !== 'beta_tester' && (
                          <button
                            onClick={handleCancelSubscription}
                            disabled={canceling}
                            className="w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium disabled:opacity-50"
                          >
                            {canceling ? 'Canceling...' : 'Cancel Subscription'}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Usage Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-6">Usage This Month</h2>

              {usage.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No usage data available yet
                </p>
              ) : (
                <div className="space-y-6">
                  {usage.map((item) => (
                    <div key={item.metric}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {item.metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        <span className="text-sm text-gray-600">
                          {item.used} / {item.limit === -1 ? '∞' : item.limit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            item.percentage >= 90 ? 'bg-red-600' : 
                            item.percentage >= 75 ? 'bg-yellow-600' : 'bg-green-600'
                          }`}
                          style={{ width: `${Math.min(item.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <FiTrendingUp className="inline w-4 h-4 mr-1" />
                  Usage resets on {subscription && new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Available Upgrades */}
            {currentTier !== 'enterprise' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Available Upgrades</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(TIER_FEATURES)
                    .filter(([key]) => {
                      const tiers = ['beta_tester', 'early_bird', 'personal', 'company', 'enterprise']
                      const currentIndex = tiers.indexOf(currentTier)
                      const tierIndex = tiers.indexOf(key)
                      return tierIndex > currentIndex
                    })
                    .map(([key, tier]) => (
                      <div key={key} className="border rounded-lg p-4 hover:border-purple-300 transition">
                        <h3 className="font-semibold text-gray-900">{tier.name}</h3>
                        <p className="text-2xl font-bold text-purple-600 mt-1">
                          ${tier.price.monthly}<span className="text-sm font-normal text-gray-600">/month</span>
                        </p>
                        <button
                          onClick={() => handleUpgrade(key)}
                          className="mt-3 w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium"
                        >
                          Upgrade to {tier.name}
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Billing History & Invoices */}
          <div className="space-y-6">
            {/* Billing Status */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Billing Status</h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                    subscription?.status === 'active' ? 'bg-green-100 text-green-700' :
                    subscription?.status === 'trialing' ? 'bg-blue-100 text-blue-700' :
                    subscription?.status === 'past_due' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {subscription?.status || 'inactive'}
                  </span>
                </div>
                
                {subscription?.stripeCustomerId && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Customer ID</span>
                    <span className="text-xs font-mono text-gray-500">
                      {subscription.stripeCustomerId.slice(-8)}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Next payment</span>
                  <span className="text-sm font-medium">
                    ${price}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Invoices */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Invoices</h2>

              {invoices.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No invoices yet
                </p>
              ) : (
                <div className="space-y-3">
                  {invoices.slice(0, 5).map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          ${(invoice.amount / 100).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(invoice.periodStart).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                          invoice.status === 'unpaid' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {invoice.status}
                        </span>
                        {invoice.metadata?.invoice_pdf && (
                          <a
                            href={invoice.metadata.invoice_pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-purple-600 hover:text-purple-700"
                          >
                            PDF
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {invoices.length > 5 && (
                <button
                  onClick={() => router.push('/dashboard/invoices')}
                  className="mt-4 w-full text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  View All Invoices
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}