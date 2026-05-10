import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import DoctorAvailability from '@/lib/models/doctorAvailability.model'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'

// PUT /api/doctor/availability/update/:doctorId
export async function PUT(request, { params }) {
  try {
    await connectDB()
    
    const { doctorId } = params
    const body = await request.json()
    const { availableDays, availableTimes, month, year, monthlyDates, removeDate, removeTime } = body
    
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

    // Try to find doctor's availability
    let doctorAvailability = await DoctorAvailability.findOne({ doctor: doctorId })

    // If no availability document exists, create one
    if (!doctorAvailability) {
      doctorAvailability = new DoctorAvailability({
        doctor: doctorId,
        monthlyAvailability: [],
      })
    }

    // Handle removal of specific date or time
    if (removeDate) {
      doctorAvailability.monthlyAvailability.forEach((entry) => {
        if (entry.month === month && entry.year === year) {
          entry.dates.forEach((day) => {
            if (day.date.toISOString().split('T')[0] === removeDate) {
              if (removeTime) {
                day.times = day.times.filter((t) => t !== removeTime) // Remove specific time
              }
              if (day.times.length === 0) {
                entry.dates = entry.dates.filter((d) => d.date.toISOString().split('T')[0] !== removeDate) // Remove the entire day if no times remain
              }
            }
          })
        }
      })

      await doctorAvailability.save()
      return NextResponse.json({ success: true, message: 'Availability removed successfully.' })
    }

    // If updating availability, check if month/year entry exists
    let existingMonth = doctorAvailability.monthlyAvailability.find(
      (entry) => entry.month === month && entry.year === year
    )

    if (!existingMonth) {
      existingMonth = {
        month,
        year,
        dates: [],
      }
      doctorAvailability.monthlyAvailability.push(existingMonth)
    }

    // Add or update the availability for the given date
    monthlyDates.forEach(({ date, times }) => {
      let existingDate = existingMonth.dates.find((d) => d.date.toISOString().split('T')[0] === date)

      if (existingDate) {
        existingDate.times = [...new Set([...existingDate.times, ...times])]
      } else {
        existingMonth.dates.push({ date: new Date(date), times })
      }
    })

    const updatedAvailability = await doctorAvailability.save()

    return NextResponse.json({
      success: true,
      message: 'Doctor availability updated successfully.',
      availability: updatedAvailability,
    })
  } catch (error) {
    console.error('Error in updateDoctorAvailability:', error)
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
      { message: error.message || 'Failed to update doctor availability' },
      { status: 500 }
    )
  }
}