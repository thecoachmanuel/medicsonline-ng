import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import Clinic from '@/lib/models/clinic.model'
import bcryptjs from 'bcryptjs'

// POST /api/auth/signup/clinic
export async function POST(request) {
  try {
    await connectDB()
    
    const {
      facilityName,
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      termsConditions,
      profileStatistcs,
      roleInFacility,
      city,
      numberOfDoctorsSpecialist,
      facilityPrograms,
      profile
    } = await request.json()

    // Array of required fields
    const requiredFields = {
      facilityName,
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      termsConditions,
      profileStatistcs,
      roleInFacility,
      city,
      numberOfDoctorsSpecialist,
      facilityPrograms,
      profile
    }

    // Check if any of the required fields is missing
    const missingField = Object.entries(requiredFields).find(([key, value]) => {
      if (typeof value === 'string') {
        return !value.trim() // check if the string is empty or contains only spaces
      }
      return value == null // check if the value is null or undefined
    })
    
    if (missingField) {
      const [fieldName] = missingField
      return NextResponse.json(
        { message: `The field '${fieldName}' is required and cannot be empty` },
        { status: 400 }
      )
    }

    // Check if clinic already exists
    const existingClinic = await Clinic.findOne({ email })
    if (existingClinic) {
      return NextResponse.json(
        { message: 'Email already in use' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = bcryptjs.hashSync(password, 10)
    
    // Create new clinic
    const newClinic = new Clinic({
      facilityName,
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hashedPassword,
      termsConditions,
      profileStatistcs,
      roleInFacility,
      city,
      numberOfDoctorsSpecialist,
      facilityPrograms,
      profile
    })

    // Save the clinic to the database
    const savedClinic = await newClinic.save()
    
    return NextResponse.json(
      { message: 'Clinic account created successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Clinic signup error:', error)
    return NextResponse.json(
      { message: 'Clinic signup failed. Please try again' },
      { status: 500 }
    )
  }
}