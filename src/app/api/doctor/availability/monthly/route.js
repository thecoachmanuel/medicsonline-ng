import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import DoctorAvailability from '@/lib/models/doctorAvailability.model'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'

// POST /api/doctor/availability/monthly
export async function POST(request) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { doctorId, month, year, availableTimes } = body
    
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

    if (!doctorId || !month || !year) {
      return NextResponse.json(
        { message: 'doctorId, month, and year are required' },
        { status: 400 }
      )
    }

    // Validate doctorId
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return NextResponse.json(
        { message: 'Invalid doctor ID format' },
        { status: 400 }
      )
    }

    // Retrieve doctor's existing availability
    const doctorAvailability = await DoctorAvailability.findOne({
      doctor: doctorId,
    })

    if (!doctorAvailability) {
      return NextResponse.json(
        { message: 'Doctor availability not found' },
        { status: 404 }
      )
    }

    if (!Array.isArray(doctorAvailability.monthlyAvailability)) {
      doctorAvailability.monthlyAvailability = []
    }

    // Check for existing monthly availability
    const existingMonth = doctorAvailability.monthlyAvailability.find(
      (entry) => entry.month === month && entry.year === year
    )

    if (existingMonth) {
      return NextResponse.json(
        { message: 'Doctor availability already exists. Please update it.' },
        { status: 400 }
      )
    }

    // Generate availability for the month
    const startOfMonth = new Date(year, month - 1, 1)
    const daysInMonth = new Date(year, month, 0).getDate()

    const dates = []

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDay = new Date(year, month - 1, day)
      const dayOfWeek = currentDay.toLocaleString('en-us', { weekday: 'long' })

      if (!['Saturday', 'Sunday'].includes(dayOfWeek) && availableTimes?.length > 0) {
        dates.push({ date: currentDay, times: availableTimes })
      }
    }

    // Push new monthly availability
    doctorAvailability.monthlyAvailability.push({
      month,
      year,
      dates,
    })

    const updatedAvailability = await doctorAvailability.save()

    const addedEntry = updatedAvailability.monthlyAvailability.find(
      (entry) => entry.month === month && entry.year === year
    )

    return NextResponse.json({
      success: true,
      message: `Monthly availability for ${month}/${year} created successfully.`,
      availability: addedEntry,
    }, { status: 201 })
  } catch (error) {
    console.error('Error in createMonthlyAvailability:', error)
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
      { message: error.message || 'Failed to create monthly availability' },
      { status: 500 }
    )
  }
}