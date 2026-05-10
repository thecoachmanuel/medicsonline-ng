import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import Appointment from '@/lib/models/appointment.model'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'

// GET /api/appointment/calendar/doctor/:doctorId/month
export async function GET(request, { params }) {
  try {
    await connectDB()
    
    const { doctorId } = params
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    const year = searchParams.get('year')

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
      console.error("Invalid doctor ID:", doctorId);
      return NextResponse.json(
        { message: "Invalid doctor ID format" },
        { status: 400 }
      )
    }        

    if (!month || !year) {
      return NextResponse.json(
        { message: "month and year query parameters are required" },
        { status: 400 }
      )
    }

    const start = new Date(`${year}-${month}-01`);
    const end = new Date(start);
    end.setMonth(start.getMonth() + 1); // Move to the next month
    end.setDate(0); // Set to the last day of the current month

    const appointments = await Appointment.find({
      doctor: doctorId,
      date: {
        $gte: start.toISOString().split('T')[0],
        $lte: end.toISOString().split('T')[0],
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Appointments retrieved successfully for the specified month',
      appointments,
    })
  } catch (error) {
    console.error("Error in getAppointmentsByMonth:", error)
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