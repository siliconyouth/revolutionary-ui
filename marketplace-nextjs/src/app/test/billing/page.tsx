'use client'

import { useState, useEffect } from 'react'

export default function TestBillingPage() {
  const [subscription, setSubscription] = useState<any>(null)
  const [usage, setUsage] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authSet, setAuthSet] = useState(false)
  const testUserId = 'cmdwivccj0000u2xkaupaleua' // The test user we created

  const setTestAuth = async () => {
    try {
      const res = await fetch('/api/test/mock-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: testUserId })
      })
      
      if (!res.ok) throw new Error('Failed to set test auth')
      setAuthSet(true)
      setError(null)
    } catch (err: any) {
      setError('Failed to set test auth: ' + err.message)
    }
  }

  const testEndpoints = async () => {
    if (!authSet) {
      setError('Please set test authentication first')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      // Test subscription endpoint
      const subRes = await fetch('/api/billing/subscription')
      if (!subRes.ok) throw new Error(`Subscription failed: ${subRes.status}`)
      const subData = await subRes.json()
      setSubscription(subData.subscription)

      // Test usage endpoint
      const usageRes = await fetch('/api/billing/usage')
      if (!usageRes.ok) throw new Error(`Usage failed: ${usageRes.status}`)
      const usageData = await usageRes.json()
      setUsage(usageData.usage || [])

      // Test invoices endpoint
      const invoicesRes = await fetch('/api/billing/invoices')
      if (!invoicesRes.ok) throw new Error(`Invoices failed: ${invoicesRes.status}`)
      const invoicesData = await invoicesRes.json()
      setInvoices(invoicesData.invoices || [])

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Billing API Test Page</h1>
      
      <div className="flex gap-4 mb-6">
        <button
          onClick={setTestAuth}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          {authSet ? '✓ Auth Set' : 'Set Test Auth'}
        </button>
        
        <button
          onClick={testEndpoints}
          disabled={loading || !authSet}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test All Endpoints'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded mb-6">
          Error: {error}
        </div>
      )}

      {/* Subscription Data */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Subscription</h2>
        <pre className="p-4 bg-gray-100 rounded overflow-auto">
          {JSON.stringify(subscription, null, 2)}
        </pre>
      </div>

      {/* Usage Data */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Usage</h2>
        <pre className="p-4 bg-gray-100 rounded overflow-auto">
          {JSON.stringify(usage, null, 2)}
        </pre>
      </div>

      {/* Invoices Data */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Invoices</h2>
        <pre className="p-4 bg-gray-100 rounded overflow-auto">
          {JSON.stringify(invoices, null, 2)}
        </pre>
      </div>
    </div>
  )
}