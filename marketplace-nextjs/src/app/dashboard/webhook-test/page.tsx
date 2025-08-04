'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

const WEBHOOK_EVENTS = [
  { value: 'checkout.session.completed', label: 'Checkout Completed' },
  { value: 'customer.subscription.created', label: 'Subscription Created' },
  { value: 'customer.subscription.updated', label: 'Subscription Updated' },
  { value: 'customer.subscription.deleted', label: 'Subscription Deleted' },
  { value: 'invoice.payment_succeeded', label: 'Payment Succeeded' },
  { value: 'invoice.payment_failed', label: 'Payment Failed' },
  { value: 'customer.subscription.trial_will_end', label: 'Trial Ending Soon' },
]

export default function WebhookTestPage() {
  const [eventType, setEventType] = useState('checkout.session.completed')
  const [email, setEmail] = useState('test@example.com')
  const [tier, setTier] = useState('early_bird')
  const [testing, setTesting] = useState(false)
  const [response, setResponse] = useState<any>(null)

  const testWebhook = async () => {
    setTesting(true)
    setResponse(null)

    try {
      const res = await fetch('/api/test/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType,
          email,
          tier,
        }),
      })

      const data = await res.json()
      setResponse(data)

      if (res.ok) {
        toast.success('Webhook test completed')
      } else {
        toast.error('Webhook test failed')
      }
    } catch (error) {
      console.error('Webhook test error:', error)
      toast.error('Failed to test webhook')
      setResponse({ error: error.message })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Webhook Testing</h1>
      
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Test Webhook Events</CardTitle>
            <CardDescription>
              Simulate Stripe webhook events to test your integration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Event Type</Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WEBHOOK_EVENTS.map((event) => (
                    <SelectItem key={event.value} value={event.value}>
                      {event.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Customer Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label>Subscription Tier</Label>
              <Select value={tier} onValueChange={setTier}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beta_tester">Beta Tester (Free)</SelectItem>
                  <SelectItem value="early_bird">Early Bird ($9.99)</SelectItem>
                  <SelectItem value="personal">Personal ($19.99)</SelectItem>
                  <SelectItem value="company">Company ($49.99)</SelectItem>
                  <SelectItem value="enterprise">Enterprise ($99.99)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={testWebhook} 
              disabled={testing}
              className="w-full"
            >
              {testing ? 'Testing...' : 'Test Webhook'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response</CardTitle>
            <CardDescription>
              Webhook test results will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            {response && (
              <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(response, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Webhook Events Explained</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">checkout.session.completed</h3>
            <p className="text-sm text-gray-600">
              Fired when a customer completes checkout. Creates/updates subscription and sends welcome notification.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold">customer.subscription.updated</h3>
            <p className="text-sm text-gray-600">
              Fired when a subscription is changed (upgrade/downgrade). Updates tier and features.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold">invoice.payment_failed</h3>
            <p className="text-sm text-gray-600">
              Fired when a payment fails. Updates subscription to past_due and notifies user.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold">customer.subscription.deleted</h3>
            <p className="text-sm text-gray-600">
              Fired when a subscription is cancelled. Updates status and sends cancellation notification.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}