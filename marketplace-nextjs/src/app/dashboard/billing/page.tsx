'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { SUBSCRIPTION_PLANS, getPlanById } from '@/lib/stripe/plans'
import { FiCreditCard, FiCalendar, FiTrendingUp, FiAlertCircle } from 'react-icons/fi'
import { loadStripe } from '@stripe/stripe-js'

interface UsageData {
  componentsUsed: number
  componentsLimit: number
  customProvidersUsed: number
  customProvidersLimit: number
  billingPeriodStart: Date
  billingPeriodEnd: Date
}

export default function BillingPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [subscription, setSubscription] = useState<any>(null)
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [billingHistory, setBillingHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [canceling, setCanceling] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin')
    } else if (user) {
      loadBillingData()
    }
  }, [user, authLoading, router])

  const loadBillingData = async () => {
    setLoading(true)
    try {
      // Load subscription
      const { data: subData } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user!.id)
        .single()

      setSubscription(subData)

      // Load usage data
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { data: usageData } = await supabase
        .from('subscription_usage')
        .select('usage_type, count')
        .eq('user_id', user!.id)
        .gte('created_at', startOfMonth.toISOString())

      // Calculate usage
      const componentsUsed = usageData
        ?.filter(u => u.usage_type === 'component_generation')
        .reduce((sum, u) => sum + u.count, 0) || 0

      const customProvidersUsed = usageData
        ?.filter(u => u.usage_type === 'custom_provider_added')
        .reduce((sum, u) => sum + u.count, 0) || 0

      const plan = getPlanById(subData?.plan || 'free')
      
      setUsage({
        componentsUsed,
        componentsLimit: plan?.limits.componentsPerMonth || 10,
        customProvidersUsed,
        customProvidersLimit: plan?.limits.customProviders || 0,
        billingPeriodStart: subData?.current_period_start 
          ? new Date(subData.current_period_start) 
          : startOfMonth,
        billingPeriodEnd: subData?.current_period_end 
          ? new Date(subData.current_period_end) 
          : new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0),
      })

      // Load billing history
      const { data: historyData } = await supabase
        .from('billing_events')
        .select('*')
        .eq('user_id', user!.id)
        .eq('event_type', 'payment.succeeded')
        .order('created_at', { ascending: false })
        .limit(10)

      setBillingHistory(historyData || [])
    } catch (error) {
      console.error('Failed to load billing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = () => {
    router.push('/pricing')
  }

  const handleManageSubscription = async () => {
    if (!subscription?.stripe_customer_id) return

    try {
      // Create portal session
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: subscription.stripe_customer_id,
        }),
      })

      const { url, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      // Redirect to Stripe portal
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
          subscriptionId: subscription.stripe_subscription_id,
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!user) return null

  const currentPlan = getPlanById(subscription?.plan || 'free')
  const usagePercent = usage ? (usage.componentsUsed / usage.componentsLimit) * 100 : 0
  const daysLeft = usage 
    ? Math.ceil((usage.billingPeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 30

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
              <h1 className="text-xl font-semibold">Billing & Usage</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Plan */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Current Plan</h2>
                {currentPlan?.id !== 'enterprise' && (
                  <button
                    onClick={handleUpgrade}
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
                        {currentPlan?.name} Plan
                      </h3>
                      <p className="text-sm text-gray-600">
                        ${subscription?.plan === 'free' ? 0 : currentPlan?.prices.monthly?.amount}/month
                      </p>
                    </div>
                  </div>
                  
                  {subscription?.cancel_at_period_end && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <FiAlertCircle className="inline w-4 h-4 mr-1" />
                        Subscription will end on {new Date(subscription.current_period_end).toLocaleDateString()}
                      </p>
                    </div>
                  )}
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
                    Renews on {usage?.billingPeriodEnd.toLocaleDateString()}
                  </p>
                </div>
              </div>

              {subscription?.stripe_subscription_id && (
                <div className="mt-6 pt-6 border-t flex gap-3">
                  <button
                    onClick={handleManageSubscription}
                    className="px-4 py-2 text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Manage Payment Method
                  </button>
                  {!subscription.cancel_at_period_end && currentPlan?.id !== 'free' && (
                    <button
                      onClick={handleCancelSubscription}
                      disabled={canceling}
                      className="px-4 py-2 text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                    >
                      {canceling ? 'Canceling...' : 'Cancel Subscription'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Usage Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-6">Usage This Month</h2>

              <div className="space-y-6">
                {/* Components Usage */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Components Generated
                    </span>
                    <span className="text-sm text-gray-600">
                      {usage?.componentsUsed || 0} / {usage?.componentsLimit === -1 ? '∞' : usage?.componentsLimit || 10}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        usagePercent >= 90 ? 'bg-red-600' : usagePercent >= 75 ? 'bg-yellow-600' : 'bg-green-600'
                      }`}
                      style={{ width: `${Math.min(usagePercent, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Custom Providers Usage */}
                {currentPlan?.limits.customProviders !== 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Custom AI Providers
                      </span>
                      <span className="text-sm text-gray-600">
                        {usage?.customProvidersUsed || 0} / {usage?.customProvidersLimit === -1 ? '∞' : usage?.customProvidersLimit || 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ 
                          width: `${usage?.customProvidersLimit === -1 
                            ? 0 
                            : Math.min(((usage?.customProvidersUsed || 0) / (usage?.customProvidersLimit || 1)) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <FiTrendingUp className="inline w-4 h-4 mr-1" />
                  Usage resets on {usage?.billingPeriodEnd.toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Billing History */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-6">Billing History</h2>

            {billingHistory.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No billing history yet
              </p>
            ) : (
              <div className="space-y-3">
                {billingHistory.map((event) => (
                  <div key={event.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        ${(event.data.amount / 100).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(event.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                      Paid
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}