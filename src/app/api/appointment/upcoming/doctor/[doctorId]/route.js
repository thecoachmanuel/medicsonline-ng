import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import Appointment from '@/lib/models/appointment.model'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'

// GET /api/appointment/upcoming/doctor/:doctorId
export async function GET(request, { params }) {
  try {
    await connectDB()
    
    const { doctorId } = params
    
    // Get token from cookies to verify doctor
    const token = request.cookies.get('access_token')?.value
    
    if (!token) {
      return NextResponse.json(
        { message: 'You are not authorized to perform this action' },
        { status: 403 }
      )
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN)
    
    // Check if user is authorized (doctor role) and matches the doctorId
    if (decoded.role !== 'doctor' || decoded._id !== doctorId) {
      return NextResponse.json(
        { message: 'You are not authorized to perform this action' },
        { status: 403 }
      )
    }

    // Validate doctor ID format
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return NextResponse.json(
        { message: 'Invalid doctor ID format' },
        { status: 400 }
      )
    }

    // Find the next upcoming appointment that is scheduled for the future
    const upcomingAppointment = await Appointment.findOne({
      doctor: doctorId,
      date: { $gte: new Date().toISOString().split('T')[0] },
      status: 'confirmed',
    })
    .sort({ date: 1, time: 1 })
    .populate('patient', 'firstName lastName email')

    if (!upcomingAppointment) {
      return NextResponse.json(
        { 
          success: false,
          message: "No upcoming appointments found" 
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