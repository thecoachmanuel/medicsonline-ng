import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import Appointment from '@/lib/models/appointment.model'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'

// PATCH /api/appointment/:appointmentId/status
export async function PATCH(request, { params }) {
  try {
    await connectDB()
    
    const { appointmentId } = params
    const body = await request.json()
    const { status } = body

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

    if (!appointmentId || !status) {
      return NextResponse.json(
        { message: "Appointment ID and status are required" },
        { status: 400 }
      )
    }

    // Validate status against your schema enum
    const allowed = new Set(["pending", "confirmed", "canceled", "completed"]);
    if (!allowed.has(status)) {
      return NextResponse.json(
        { message: `Invalid status "${status}". Allowed: pending, confirmed, canceled, completed` },
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

    // Ensure only the owning doctor can change status
    if (String(appt.doctor) !== String(decoded._id)) {
      return NextResponse.json(
        { message: "Not allowed to update this appointment" },
        { status: 403 }
      )
    }

    const previousStatus = appt.status;

    // No-op if unchanged
    if (previousStatus === status) {
      return NextResponse.json({
        success: true,
        message: "Status unchanged",
        appointment: appt,
      })
    }

    // Update & save
    appt.status = status;
    await appt.save();

    // For realtime emit, we would need to implement a different solution
    // as Next.js doesn't have the same socket.io integration as Express

    return NextResponse.json({
      success: true,
      message: "Appointment status updated successfully",
      appointment: appt,
    })
  } catch (error) {
    console.error('Error updating appointment status:', error)
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
      { message: 'Failed to update appointment status' },
      { status: 500 }
    )
  }
}