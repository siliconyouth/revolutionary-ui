import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PrismaClient } from '@prisma/client'
import { cookies } from 'next/headers'

const prisma = new PrismaClient()

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
      return NextResponse.json({ usage: [] })
    }

    // Get usage records for the current billing period
    const usageRecords = await prisma.usageRecord.findMany({
      where: {
        userId,
        createdAt: {
          gte: subscription.currentPeriodStart,
          lte: subscription.currentPeriodEnd
        }
      },
      select: {
        metric: true,
        value: true
      }
    })

    // Aggregate usage by metric
    const usageMap = new Map<string, number>()
    usageRecords.forEach(record => {
      const current = usageMap.get(record.metric) || 0
      usageMap.set(record.metric, current + record.value)
    })

    // Get feature limits
    const limits = getFeatureLimits(subscription.tier)

    // Format usage data
    const usage = Array.from(usageMap.entries()).map(([metric, used]) => {
      const limit = limits[metric] || -1
      return {
        metric,
        used,
        limit,
        percentage: limit > 0 ? (used / limit) * 100 : 0
      }
    })

    // Add metrics that haven't been used yet
    Object.keys(limits).forEach(metric => {
      if (!usageMap.has(metric)) {
        usage.push({
          metric,
          used: 0,
          limit: limits[metric],
          percentage: 0
        })
      }
    })

    return NextResponse.json({ usage })
  } catch (error) {
    console.error('Error fetching usage:', error)
    return NextResponse.json(
      { error: 'Failed to fetch usage' },
      { status: 500 }
    )
  }
}

function getFeatureLimits(tier: string): Record<string, number> {
  const limits: Record<string, Record<string, number>> = {
    beta_tester: {
      ai_generations: -1, // unlimited
      private_components: -1,
      storage_gb: 20,
      api_calls_daily: 2000,
      team_members: 5
    },
    early_bird: {
      ai_generations: -1,
      private_components: -1,
      storage_gb: 20,
      api_calls_daily: 2000,
      team_members: 5
    },
    personal: {
      ai_generations: -1,
      private_components: -1,
      storage_gb: 20,
      api_calls_daily: 2000,
      team_members: 1
    },
    company: {
      ai_generations: -1,
      private_components: -1,
      storage_gb: 100,
      api_calls_daily: 10000,
      team_members: 10
    },
    enterprise: {
      ai_generations: -1,
      private_components: -1,
      storage_gb: -1,
      api_calls_daily: -1,
      team_members: -1
    },
    free: {
      ai_generations: 10,
      private_components: 3,
      storage_gb: 1,
      api_calls_daily: 100,
      team_members: 1
    }
  }

  return limits[tier] || limits.free
}