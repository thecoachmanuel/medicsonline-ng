import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'

// POST /api/clinic/logout
export async function POST() {
  try {
    await connectDB()
    
    // Create a response to clear the access_token cookie
    const response = NextResponse.json({ message: 'Logout successful' })
    
    // Clear the access_token cookie
    response.cookies.set('access_token', '', {
      httpOnly: true,
      expires: new Date(0), // Set expiry to past date to delete cookie
      path: '/',
    })
    
    return response
  } catch (error) {
    console.error('Error during logout:', error)
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}