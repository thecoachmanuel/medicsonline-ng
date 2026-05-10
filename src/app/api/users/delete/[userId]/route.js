import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import User from '@/lib/models/user.model'
import jwt from 'jsonwebtoken'

// DELETE /api/users/delete/:userId
export async function DELETE(request, { params }) {
  try {
    await connectDB()
    
    const { userId } = params
    
    // Get token from cookies to verify user
    const token = request.cookies.get('access_token')?.value
    
    if (!token) {
      return NextResponse.json(
        { message: 'You are not authorized to perform this action' },
        { status: 403 }
      )
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN)
    
    // Check if user is authorized to delete this user
    // Either the user is deleting their own account or they are an admin
    if (decoded.id !== userId && decoded.role !== 'admin') {
      return NextResponse.json(
        { message: 'You are not authorized to delete this user' },
        { status: 403 }
      )
    }

    const deletedUser = await User.findByIdAndDelete(userId)
    
    if (!deletedUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ message: 'User has been deleted' })
  } catch (error) {
    console.error('Error deleting user:', error)
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 401 }
      )
    }
    if (error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { message: 'Token expired' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { message: 'Failed to delete user' },
      { status: 500 }
    )
  }
}