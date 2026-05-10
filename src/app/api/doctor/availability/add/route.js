import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import DoctorAvailability from '@/lib/models/doctorAvailability.model'
import jwt from 'jsonwebtoken'

// POST /api/doctor/availability/add
export async function POST(request) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { doctor, availableDays, availableTimes } = body
    
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
    
    // Check if user is authorized (doctor or admin)
    if (decoded.role !== 'doctor' && decoded.role !== 'admin') {
      return NextResponse.json(
        { message: 'You are not authorized to perform this action' },
        { status: 403 }
      )
    }

    // Check if doctor availability already exists
    const existingAvailability = await DoctorAvailability.findOne({ doctor })
    if (existingAvailability) {
      return NextResponse.json(
        { message: 'Doctor availability already exists' },
        { status: 400 }
      )
    }

    const newDoctorAvailability = new DoctorAvailability({
      doctor,
      availableDays,
      availableTimes
    })

    const savedAvailability = await newDoctorAvailability.save()

    return NextResponse.json({
      success: true,
      message: 'Doctor availability added successfully',
      availability: savedAvailability,
    }, { status: 201 })
  } catch (error) {
    console.error('Error in addDoctorAvailability:', error)
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
      { message: error.message || 'Failed to add doctor availability' },
      { status: 500 }
    )
  }
}