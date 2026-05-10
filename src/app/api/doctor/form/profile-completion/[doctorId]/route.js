import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import DoctorForm from '@/lib/models/doctorForm.model'
import jwt from 'jsonwebtoken'

// PUT /api/doctor/form/profile-completion/:doctorId
export async function PUT(request, { params }) {
  try {
    await connectDB()
    
    const { doctorId } = params
    const body = await request.json()
    const { profileCompletion } = body
    
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

    const updatedDoctor = await DoctorForm.findByIdAndUpdate(
      doctorId,
      { profileCompletion },
      { new: true }
    ).select('-password')
    
    if (!updatedDoctor) {
      return NextResponse.json(
        { message: 'Doctor not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      message: 'Profile completion updated successfully',
      doctor: updatedDoctor
    })
  } catch (error) {
    console.error('Error updating profile completion:', error)
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
      { message: 'Failed to update profile completion' },
      { status: 500 }
    )
  }
}