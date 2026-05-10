import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import User from '@/lib/models/user.model'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'

// PUT /api/users/update/:userId
export async function PUT(request, { params }) {
  try {
    await connectDB()
    
    const { userId } = params
    const body = await request.json()
    
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
    
    // Check if user is authorized to update this profile
    if (decoded.id !== userId) {
      return NextResponse.json(
        { message: 'You are not authorized to perform this action' },
        { status: 403 }
      )
    }

    // Password strength and length validation
    if (body.password) {
      if (body.password.length < 6) {
        return NextResponse.json(
          { message: 'Password must be at least 6 characters long' },
          { status: 400 }
        )
      }
      body.password = bcryptjs.hashSync(body.password, 10)
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          email: body.email,
          password: body.password,
          firstName: body.firstName,
          lastName: body.lastName,
          phoneNumber: body.phoneNumber
        },
      },
      { new: true }
    )
    
    if (!updatedUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }
    
    const { password, ...rest } = updatedUser._doc
    
    return NextResponse.json(rest)
  } catch (error) {
    console.error('Error updating user:', error)
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
      { message: 'Failed to update user information' },
      { status: 500 }
    )
  }
}