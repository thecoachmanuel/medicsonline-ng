import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import User from '@/lib/models/user.model'
import bcryptjs from 'bcryptjs'

// POST /api/auth/signup
export async function POST(request) {
  try {
    await connectDB()
    
    const { 
      consentToMarketing, 
      email, 
      password,
      firstName,
      lastName,
      phoneNumber,
      termsConditions
    } = await request.json()

    // Validate required fields
    const requiredFields = { email, password }
    const missingField = Object.entries(requiredFields).find(([key, value]) => !value || value.trim() === '')
    if (missingField) {
      const [fieldName] = missingField
      return NextResponse.json(
        { message: `The field '${fieldName}' is required and cannot be empty` },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Check for duplicate email
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash the password
    const hashedPassword = bcryptjs.hashSync(password, 10)

    // Create new user
    const newUser = new User({
      consentToMarketing: consentToMarketing || false, 
      email, 
      password: hashedPassword,
      termsConditions: termsConditions || false,
      firstName,
      lastName,
      phoneNumber
    })

    // Save the new user
    await newUser.save()

    return NextResponse.json(
      { message: 'User created successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { message: 'Signup failed. Please try again' },
      { status: 500 }
    )
  }
}