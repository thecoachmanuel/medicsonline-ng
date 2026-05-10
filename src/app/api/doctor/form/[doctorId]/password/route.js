import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import DoctorForm from '@/lib/models/doctorForm.model'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'

// PUT /api/doctor/form/:doctorId/password
export async function PUT(request, { params }) {
  try {
    await connectDB()
    
    const { doctorId } = params
    const body = await request.json()
    const { currentPassword, newPassword } = body
    
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

    // Find the doctor
    const doctor = await DoctorForm.findById(doctorId)
    if (!doctor) {
      return NextResponse.json(
        { message: 'Doctor not found' },
        { status: 404 }
      )
    }

    // Check if current password is correct
    const isPasswordCorrect = await bcryptjs.compare(currentPassword, doctor.password)
    if (!isPasswordCorrect) {
      return NextResponse.json(
        { message: 'Current password is incorrect' },
        { status: 400 }
      )
    }

    // Hash the new password
    const hashedPassword = await bcryptjs.hash(newPassword, 10)

    // Update the password
    doctor.password = hashedPassword
    await doctor.save()

    return NextResponse.json({ message: 'Password updated successfully' })
  } catch (error) {
    console.error('Error changing password:', error)
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
      { message: 'Failed to change password' },
      { status: 500 }
    )
  }
}