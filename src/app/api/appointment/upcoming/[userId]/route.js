import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import Appointment from '@/lib/models/appointment.model'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'

// GET /api/appointment/upcoming/:userId
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

    // Find the next upcoming appointment that is scheduled for the future
    const upcomingAppointment = await Appointment.findOne({
      patient: userId,
      date: { $gte: new Date().toISOString().split('T')[0] },
      status: { $in: ['pending', 'confirmed'] },
    })
    .sort({ date: 1, time: 1 }) 
    .populate('doctor', 'firstName lastName medicalSpecialtyCategory address profilePicture medicalCategory')

    if (!upcomingAppointment) {
      return NextResponse.json(
        { 
          success: false,
          message: "You have no upcoming appointments" 
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Upcoming appointment retrieved successfully",
      appointment: upcomingAppointment,
    })
  } catch (error) {
    console.error('Error fetching upcoming appointment:', error)
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
      { message: 'Failed to retrieve upcoming appointment' },
      { status: 500 }
    )
  }
}