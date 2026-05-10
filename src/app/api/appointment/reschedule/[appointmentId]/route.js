import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import Appointment from '@/lib/models/appointment.model'
import DoctorAvailability from '@/lib/models/doctorAvailability.model'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'

// PUT /api/appointment/reschedule/:appointmentId
export async function PUT(request, { params }) {
  try {
    await connectDB()
    
    const { appointmentId } = params
    const body = await request.json()
    const { newDate, newTime } = body

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

    // Validate input
    if (!appointmentId || !newDate || !newTime) {
      return NextResponse.json(
        { message: "Appointment ID, new date, and new time are required" },
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

    // Find the appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return NextResponse.json(
        { message: "Appointment not found" },
        { status: 404 }
      )
    }

    // Save previous slot BEFORE changing
    const prevDate = appointment.date;
    const prevTime = appointment.time;

    // Check if new date/time is in the future
    const newDateTime = new Date(`${newDate}T${newTime}:00`);
    if (newDateTime <= new Date()) {
      return NextResponse.json(
        { message: "New appointment time must be in the future" },
        { status: 400 }
      )
    }

    // Check if doctor is available at the new date/time
    const doctorAvailability = await DoctorAvailability.findOne({ doctor: appointment.doctor });
    if (!doctorAvailability) {
      return NextResponse.json(
        { message: "Doctor has no availability configured" },
        { status: 400 }
      )
    }

    const selectedDay = newDateTime.toLocaleString("en-us", { weekday: "long" });

    if (!doctorAvailability.availableDays.includes(selectedDay)) {
      return NextResponse.json(
        { message: `Doctor is not available on ${selectedDay}` },
        { status: 400 }
      )
    }

    if (!doctorAvailability.availableTimes.includes(newTime)) {
      return NextResponse.json(
        { message: `Doctor is not available at ${newTime}` },
        { status: 400 }
      )
    }

    // Check for overlapping appointments
    const overlappingAppointment = await Appointment.findOne({
      doctor: appointment.doctor,
      date: new Date(newDate), // ensure Date type
      time: newTime,
      _id: { $ne: appointment._id }, // exclude current one
    });

    if (overlappingAppointment) {
      return NextResponse.json(
        { message: "This time slot is already booked" },
        { status: 400 }
      )
    }

    // Update the appointment
    appointment.date = newDate;
    appointment.time = newTime;
    await appointment.save();

    // For realtime emit, we would need to implement a different solution
    // as Next.js doesn't have the same socket.io integration as Express

    return NextResponse.json({
      success: true,
      message: "Appointment rescheduled successfully",
      appointment,
    })
  } catch (error) {
    console.error('Error in rescheduling appointment:', error)
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
      { message: 'Failed to reschedule appointment' },
      { status: 500 }
    )
  }
}