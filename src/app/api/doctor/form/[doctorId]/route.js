import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import DoctorForm from '@/lib/models/doctorForm.model'
import DoctorAvailability from '@/lib/models/doctorAvailability.model'
import Review from '@/lib/models/review.model'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'

// DELETE /api/doctor/form/:doctorId
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

    // Validate doctorId
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return NextResponse.json(
        { message: 'Invalid doctor ID format' },
        { status: 400 }
      )
    }

    // Start a transaction
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      // Delete related collections
      await DoctorAvailability.deleteMany({ doctor: doctorId }).session(session)
      await Review.deleteMany({ doctor: doctorId }).session(session)
      // TODO: await Appointment.deleteMany({ doctor: doctorId }).session(session) // if/when you add

      // Delete the Doctor record
      const deletedDoctor = await DoctorForm.findByIdAndDelete(doctorId).session(session)

      if (!deletedDoctor) {
        await session.abortTransaction()
        session.endSession()
        return NextResponse.json(
          { message: 'Doctor not found' },
          { status: 404 }
      )
      }

      await session.commitTransaction()
      session.endSession()

      return NextResponse.json({ message: 'Doctor account deleted successfully' })
    } catch (error) {
      await session.abortTransaction()
      session.endSession()
      throw error
    }
  } catch (error) {
    console.error('Failed to delete doctor account:', error)
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
      { message: 'Failed to delete doctor account' },
      { status: 500 }
    )
  }
}