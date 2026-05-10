import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import Appointment from '@/lib/models/appointment.model'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'

// GET /api/appointment/user/:userId
export async function GET(request, { params }) {
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
    
    // Check if user is authorized (user role) and matches the userId
    if (decoded.role !== 'user' || decoded._id !== userId) {
      return NextResponse.json(
        { message: 'You are not authorized to perform this action' },
        { status: 403 }
      )
    }

    // Validate user ID format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { message: 'Invalid user ID format' },
        { status: 400 }
      )
    }

    // Find appointments for the user
    const appointments = await Appointment.find({ patient: userId })
      .populate('doctor', 'firstName lastName medicalCategory profilePicture')
      .sort({ createdAt: -1 })

    return NextResponse.json({ appointments })
  } catch (error) {
    console.error('Error fetching appointments:', error)
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
      { message: 'Failed to fetch appointments' },
      { status: 500 }
    )
  }
}