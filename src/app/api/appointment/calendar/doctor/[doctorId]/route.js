import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import Appointment from '@/lib/models/appointment.model'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'

// GET /api/appointment/calendar/doctor/:doctorId
export async function GET(request, { params }) {
  try {
    await connectDB()
    
    const { doctorId } = params
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

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

    if (!date) {
      return NextResponse.json(
        { message: "Date query parameter is required" },
        { status: 400 }
      )
    }

    // Validate doctor ID format
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return NextResponse.json(
        { message: 'Invalid doctor ID format' },
        { status: 400 }
      )
    }

    const appointments = await Appointment.find({ 
      doctor: doctorId,
      date: date 
    });
    
    if (!appointments || appointments.length === 0) {
      return NextResponse.json({
        success: false,
        message: `No appointments found for date ${date}.`,
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Appointments for ${date} retrieved successfully.`,
      appointments: appointments || [],
    })
  } catch (error) {
    console.error('Error in getAppointmentsByDate:', error)
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