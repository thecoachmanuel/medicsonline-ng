import { NextResponse } from 'next/server'

// POST /api/auth/logout
export async function POST() {
  try {
    // Clear the token cookie
    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    )
    
    // Remove the token cookie
    response.cookies.set('access_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
      expires: new Date(0) // Expire immediately
    })
    
    return response
  } catch (error) {
    console.error('Error during logout:', error)
    return NextResponse.json(
      { message: 'Failed to logout' },
      { status: 500 }
    )
  }
}