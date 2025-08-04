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
      const { data: { user: authUser } } = await supabase.auth.getUser()
      userId = authUser?.id || null
    }
    
    if (!userId) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        subscription: {
          select: {
            tier: true,
            status: true,
            billingPeriod: true
          }
        }
      }
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}