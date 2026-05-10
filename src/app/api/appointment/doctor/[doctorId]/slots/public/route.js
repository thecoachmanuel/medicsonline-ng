import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import Appointment from '@/lib/models/appointment.model'
import mongoose from 'mongoose'

// GET /api/appointment/doctor/:doctorId/slots/public
export async function GET(request, { params }) {
  try {
    await connectDB()
    
    const { doctorId } = params
    
    // Validate doctor ID format
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return NextResponse.json(
        { message: 'Invalid doctor ID format' },
        { status: 400 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    
    if (!date) {
      return NextResponse.json(
        { message: 'Date parameter is required' },
        { status: 400 }
      )
    }
    
    // Validate date format
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) {
      return NextResponse.json(
        { message: 'Invalid date format' },
        { status: 400 }
      )
    }
    
    // Find appointments for the doctor on the specified date
    const appointments = await Appointment.find({
      doctor: doctorId,
      date: dateObj.toISOString().split('T')[0]
    }).select('time')
    
    // Extract just the time values
    const bookedSlots = appointments.map(appt => appt.time)
    
    return NextResponse.json({ bookedSlots })
  } catch (error) {
    console.error('Error fetching booked slots:', error)
    return NextResponse.json(
      { message: 'Failed to fetch booked slots' },
      { status: 500 }
    )
  }
}