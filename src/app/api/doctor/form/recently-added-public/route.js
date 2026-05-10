import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import DoctorForm from '@/lib/models/doctorForm.model'

// GET /api/doctor/form/recently-added-public
export async function GET(request) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1  // Default to page 1
    const limit = 10  // Number of doctors per page
    const skip = (page - 1) * limit

    const doctors = await DoctorForm.find()
      .sort({ createdAt: -1 })  // Sort by most recent
      .skip(skip)
      .limit(limit)
      .select('firstName lastName profilePicture city medicalCategory')  // Adjust as needed

    const totalDoctors = await DoctorForm.countDocuments()  // Total doctors count for pagination

    return NextResponse.json({
      success: true,
      data: {
        doctors,
        totalPages: Math.ceil(totalDoctors / limit),
        currentPage: page,
        totalDoctors,
      },
    })
  } catch (error) {
    console.error('Error fetching recently added doctors:', error)
    return NextResponse.json(
      { message: 'Failed to fetch recently added doctors.' },
      { status: 500 }
    )
  }
}