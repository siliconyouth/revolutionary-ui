import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  try {
    let userId: string | null = null
    
    // Check for test user cookie first (for development)
    const cookieStore = await cookies()
    const testUserId = cookieStore.get('test-user-id')?.value
    
    if (testUserId) {
      userId = testUserId
    } else {
      // Fall back to Supabase auth
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      userId = user?.id || null
    }
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: {
        features: {
          include: {
            feature: true
          }
        }
      }
    })

    if (!subscription) {
      // Return a default subscription object for users without a subscription
      return NextResponse.json({
        subscription: {
          id: '',
          tier: 'free',
          status: 'inactive',
          billingPeriod: 'monthly',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          cancelAtPeriodEnd: false
        }
      })
    }

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}