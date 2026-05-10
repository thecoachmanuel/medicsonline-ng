import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import DoctorForm from '@/lib/models/doctorForm.model'
import jwt from 'jsonwebtoken'

// GET /api/auth/me
export async function GET(request) {
  try {
    await connectDB()
    
    // Get token from cookies
    const token = request.cookies.get('access_token')?.value
    
    if (!token) {
      return NextResponse.json(
        { message: 'No token found, please login' },
        { status: 401 }
      )
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN)
    const doctorId = decoded.id
    
    const doctor = await DoctorForm.findById(doctorId).select('-password')
    
    if (!doctor) {
      return NextResponse.json(
        { message: 'Doctor not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(doctor)
  } catch (error) {
    console.error('Get logged in doctor error:', error)
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
      { message: 'Failed to get doctor information' },
      { status: 500 }
    )
  }
}