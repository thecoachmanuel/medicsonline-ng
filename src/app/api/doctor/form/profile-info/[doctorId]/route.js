import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import DoctorForm from '@/lib/models/doctorForm.model'

// GET /api/doctor/form/profile-info/:doctorId
export async function GET(request, { params }) {
  try {
    await connectDB()
    
    const { doctorId } = params
    
    const doctor = await DoctorForm.findById(doctorId).select('-password')
    
    if (!doctor) {
      return NextResponse.json(
        { message: 'Doctor not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(doctor)
  } catch (error) {
    console.error('Error fetching doctor profile:', error)
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}