import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import Appointment from '@/lib/models/appointment.model'
import DoctorAvailability from '@/lib/models/doctorAvailability.model'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'

// POST /api/appointment/create
export async function POST(request) {
  try {
    await connectDB()
    
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
    
    // Check if user is authorized (user role)
    if (decoded.role !== 'user') {
      return NextResponse.json(
        { message: 'You are not authorized to perform this action' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { 
      patient, 
      doctor, 
      date, 
      time, 
      reason, 
      status, 
      specialNotes,
      phoneNumber, 
      dateOfBirth,
      consent
    } = body

    // Validate input
    if (!patient || !doctor || !date || !time || !reason) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate doctor ID format
    if (!mongoose.Types.ObjectId.isValid(doctor)) {
      return NextResponse.json(
        { message: 'Invalid doctor ID format' },
        { status: 400 }
      )
    }

    // validate patients ID format
    if (!mongoose.Types.ObjectId.isValid(patient)) {
      return NextResponse.json(
        { message: 'Invalid patient ID format' },
        { status: 400 }
      )
    }

    // Convert Date of birth to date object
    const parsedDateOfBirth = new Date(dateOfBirth)
    if (isNaN(parsedDateOfBirth.getTime())) {
      return NextResponse.json(
        { message: 'Invalid date format for dateOfBirth' },
        { status: 400 }
      )
    }

    // Format phone number to a string
    const formattedPhoneNumber = String(phoneNumber)

    // Ensure consent is a boolean
    const parsedConsent = Boolean(consent)

    // Check doctor availability
    const doctorAvailability = await DoctorAvailability.findOne({ doctor: new mongoose.Types.ObjectId(doctor) })

    if (!doctorAvailability) {
      return NextResponse.json(
        { message: `Doctor with ID ${doctor} has no availability configured` },
        { status: 400 }
      )
    }

    // Check if the selected day is available
    const selectedDay = new Date(date).toLocaleString('en-us', { weekday: 'long' })
    if (!doctorAvailability.availableDays.includes(selectedDay)) {
      return NextResponse.json(
        { message: `Doctor is not available on ${selectedDay}` },
        { status: 400 }
      )
    }

    // Check if the selected time is available
    if (!doctorAvailability.availableTimes.includes(time)) {
      return NextResponse.json(
        { message: `Doctor is not available at ${time}` },
        { status: 400 }
      )
    }

    // Check for overlapping appointments
    const overlappingAppointment = await Appointment.findOne({ doctor, date, time })
    if (overlappingAppointment) {
      return NextResponse.json(
        { message: 'This time slot is already booked' },
        { status: 400 }
      )
    }

    // Create the appointment
    const newAppointment = new Appointment({
      patient,
      doctor,
      date,
      time,
      reason,
      status: status || 'pending',
      specialNotes,
      phoneNumber: formattedPhoneNumber,
      dateOfBirth: parsedDateOfBirth,
      consent: parsedConsent
    })

    // Save the appointment
    const savedAppointment = await newAppointment.save()

    return NextResponse.json({
      message: 'Appointment created successfully',
      appointment: savedAppointment
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating appointment:', error)
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
      { message: 'Failed to create appointment' },
      { status: 500 }
    )
  }
}