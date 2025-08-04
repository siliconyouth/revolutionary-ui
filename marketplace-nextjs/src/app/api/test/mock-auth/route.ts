import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// This is a test endpoint to simulate an authenticated user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Set a test cookie to simulate authentication
    const cookieStore = await cookies()
    cookieStore.set('test-user-id', userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    })

    return NextResponse.json({ 
      success: true,
      message: `Test authentication set for user: ${userId}`
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to set test auth' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  const cookieStore = await cookies()
  cookieStore.delete('test-user-id')
  
  return NextResponse.json({ 
    success: true,
    message: 'Test authentication cleared'
  })
}