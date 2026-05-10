import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import DoctorAvailability from '@/lib/models/doctorAvailability.model'

// GET /api/doctor/availability/search
export async function GET(request) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    
    if (!date) {
      return NextResponse.json(
        { message: 'Please provide a date to filter by.' },
        { status: 400 }
      )
    }

    // Find all doctors available on the specified date
    const availableDoctors = await DoctorAvailability.find({
      'monthlyAvailability.dates.date': new Date(date)
    }).populate('doctor', 'firstName lastName medicalCategory city profilePicture')

    if (!availableDoctors.length) {
      return NextResponse.json(
        { success: false, message: 'No doctors found with the selected availability.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, doctors: availableDoctors })
  } catch (error) {
    console.error('Error fetching doctors by availability:', error)
    return NextResponse.json(
      { message: 'Failed to fetch available doctors.' },
      { status: 500 }
    )
  }
}