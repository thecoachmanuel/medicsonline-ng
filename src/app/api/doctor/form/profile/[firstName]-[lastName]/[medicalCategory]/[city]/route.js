import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import DoctorForm from '@/lib/models/doctorForm.model'

// GET /api/doctor/form/profile/:firstName-:lastName/:medicalCategory/:city
export async function GET(request, { params }) {
  try {
    await connectDB()
    
    const { firstName, lastName, medicalCategory, city } = params
    
    const doctor = await DoctorForm.findOne({
      firstName: new RegExp(`^${firstName}$`, 'i'), 
      lastName: new RegExp(`^${lastName}$`, 'i'),
      medicalCategory: new RegExp(`^${medicalCategory}$`, 'i'),
      city: new RegExp(`^${city}$`, 'i'),
    })

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