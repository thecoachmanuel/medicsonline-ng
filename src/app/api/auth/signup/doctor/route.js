import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import DoctorForm from '@/lib/models/doctorForm.model'
import Specialty from '@/lib/models/specialty.model'
import bcryptjs from 'bcryptjs'

// POST /api/auth/signup/doctor
export async function POST(request) {
  try {
    await connectDB()
    
    const {
      firstName,
      lastName,
      email,
      password,
      medicalCategory,
      city,
      countryCode,
      phoneNumber,
      termsConditions,
      profileStatistcs,
      location, 
      experience,
      profilePicture,
    } = await request.json()

    // Create an array of required fields
    const requiredFields = {
      firstName,
      lastName,
      email,
      password,
      medicalCategory,
      city,
      countryCode,
      phoneNumber,
      termsConditions,
      profileStatistcs
    }

    const missingField = Object.entries(requiredFields).find(([key, value]) => {
      if (key === 'termsConditions' || key === 'profileStatistcs') {
        return value !== true // Boolean must be true
      }
      if (typeof value === 'string') {
        return value.trim() === ''
      }
      return !value
    })

    if (missingField) {
      const [fieldName] = missingField
      return NextResponse.json(
        { message: `The field '${fieldName}' is required and cannot be empty` },
        { status: 400 }
      )
    }

    // Check if doctor already exists
    const existingDoctor = await DoctorForm.findOne({ email })
    if (existingDoctor) {
      return NextResponse.json(
        { message: 'Email already in use' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = bcryptjs.hashSync(password, 10)

    // Find specialty
    const specialtyDoc = await Specialty.findOne({ name: medicalCategory })
    if (!specialtyDoc) {
      return NextResponse.json(
        { message: `No specialty found for ${medicalCategory}` },
        { status: 400 }
      )
    }

    // Create new doctor
    const newDoctor = new DoctorForm({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      specialty: specialtyDoc._id,
      location: location || 'Unknown',
      experience: experience || 0,
      medicalCategory,
      treatments: specialtyDoc.treatments,
      profilePicture,
      city,          
      countryCode,   
      phoneNumber, 
      role: 'doctor',
    })

    const savedDoctor = await newDoctor.save()
    if (!savedDoctor) {
      return NextResponse.json(
        { message: 'Failed to save doctor.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Doctor account created successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Doctor signup error:', error)
    return NextResponse.json(
      { message: 'Doctor signup failed. Please try again' },
      { status: 500 }
    )
  }
}