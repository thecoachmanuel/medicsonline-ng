import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import DoctorAvailability from '@/lib/models/doctorAvailability.model'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'

// DELETE /api/doctor/availability/delete/:doctorId
export async function DELETE(request, { params }) {
  try {
    await connectDB()
    
    const { doctorId } = params
    
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

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return NextResponse.json(
        { message: 'Invalid doctor ID format' },
        { status: 400 }
      )
    }

    const deletedAvailability = await DoctorAvailability.findOneAndDelete({ doctor: doctorId })

    if (!deletedAvailability) {
      return NextResponse.json(
        { message: `No availability found for doctor ID ${doctorId}.` },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Doctor availability deleted successfully.',
      availability: deletedAvailability,
    })
  } catch (error) {
    console.error('Error in deleteDoctorAvailability:', error)
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
      { message: error.message || 'Failed to delete doctor availability' },
      { status: 500 }
    )
  }
}