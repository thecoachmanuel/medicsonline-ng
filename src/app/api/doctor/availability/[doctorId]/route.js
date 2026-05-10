import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import DoctorAvailability from '@/lib/models/doctorAvailability.model'
import mongoose from 'mongoose'

// GET /api/doctor/availability/:doctorId
export async function GET(request, { params }) {
  try {
    await connectDB()
    
    const { doctorId } = params
    
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return NextResponse.json(
        { message: 'Invalid doctor ID format' },
        { status: 400 }
      )
    }

    // Query the database for the doctor availability
    const availability = await DoctorAvailability.findOne({ doctor: doctorId })

    if (!availability) {
      return NextResponse.json(
        { message: `No availability found for doctor ID ${doctorId}.` },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Doctor availability retrieved successfully.',
      availability,
    })
  } catch (error) {
    console.error('Error in getDoctorAvailability:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to retrieve doctor availability' },
      { status: 500 }
    )
  }
}