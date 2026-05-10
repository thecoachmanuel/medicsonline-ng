import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import Appointment from '@/lib/models/appointment.model'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'

// PATCH /api/appointment/cancel/:appointmentId
export async function PATCH(request, { params }) {
  try {
    await connectDB()
    
    const { appointmentId } = params
    const body = await request.json()
    const { reason } = body

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

    if (!appointmentId) {
      return NextResponse.json(
        { message: "Appointment ID is required" },
        { status: 400 }
      )
    }

    // Validate appointment ID format
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return NextResponse.json(
        { message: 'Invalid appointment ID format' },
        { status: 400 }
      )
    }

    const appt = await Appointment.findById(appointmentId);
    if (!appt) {
      return NextResponse.json(
        { message: "Appointment not found" },
        { status: 404 }
      )
    }

    // Ensure user is allowed (doctor or patient linked to appt)
    if (
      String(appt.doctor) !== String(decoded._id) &&
      String(appt.patient) !== String(decoded._id)
    ) {
      return NextResponse.json(
        { message: "Not allowed to cancel this appointment" },
        { status: 403 }
      )
    }

    // Only cancel if not already completed/canceled
    if (appt.status === "completed") {
      return NextResponse.json(
        { message: "Completed appointments cannot be canceled" },
        { status: 400 }
      )
    }
    if (appt.status === "canceled") {
      return NextResponse.json(
        { message: "This appointment is already canceled" },
        { status: 400 }
      )
    }

    // Soft cancel
    appt.status = "canceled";
    appt.canceledAt = new Date();
    appt.canceledBy = decoded.role || "unknown"; 
    if (reason) appt.cancelReason = reason;

    await appt.save();

    // For realtime emit, we would need to implement a different solution
    // as Next.js doesn't have the same socket.io integration as Express

    return NextResponse.json({
      success: true,
      message: "Appointment canceled successfully",
      appointment: appt,
    })
  } catch (error) {
    console.error('Error in cancelAppointment:', error)
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
      { message: 'Failed to cancel appointment' },
      { status: 500 }
    )
  }
}