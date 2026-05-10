import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import Appointment from '@/lib/models/appointment.model'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'

// GET /api/appointment/calendar/doctor/:doctorId/week
export async function GET(request, { params }) {
  try {
    await connectDB()
    
    const { doctorId } = params
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')

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
    
    // Check if user is authorized (doctor or user role)
    if (decoded.role !== 'doctor' && decoded.role !== 'user') {
      return NextResponse.json(
        { message: 'You are not authorized to perform this action' },
        { status: 403 }
      )
    }

    // Validate doctor ID format
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return NextResponse.json(
        { message: "Invalid doctor ID format" },
        { status: 400 }
      )
    }

    if (!startDate) {
      return NextResponse.json(
        { message: "startDate query parameter is required" },
        { status: 400 }
      )
    }

    const start = new Date(startDate)
    const end = new Date(start)
    end.setDate(start.getDate() + 6) // Add 6 days to get the end of the week

    const appointments = await Appointment.find({
      doctor: doctorId,
      date: { 
        $gte: start.toISOString().split('T')[0],
        $lte: end.toISOString().split('T')[0], 
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Appointments retrieved successfully for the specified week',
      appointments,
    })
  } catch (error) {
    console.error("Error in getAppointmentsByWeek:", error)
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
      { message: 'Failed to retrieve appointments' },
      { status: 500 }
    )
  }
}