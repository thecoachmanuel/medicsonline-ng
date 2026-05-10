import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import DoctorForm from '@/lib/models/doctorForm.model'
import User from '@/lib/models/user.model'
import Clinic from '@/lib/models/clinic.model'
import Admin from '@/lib/models/admin.model'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'

// POST /api/auth/login
export async function POST(request) {
  try {
    await connectDB()
    
    const { email, password } = await request.json()

    if (!email || !password || email === '' || password === '') {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      )
    }

    let validUser = null
    let userRole = null

    // Check across all models
    validUser = await DoctorForm.findOne({ email })
    if (validUser) {
      userRole = 'doctor'
    }
    
    if (!validUser) {
      validUser = await User.findOne({ email })
      if (validUser) {
        userRole = 'user'
      }
    }

    if (!validUser) {
      validUser = await Clinic.findOne({ email })
      if (validUser) {
        userRole = 'clinic'
      }
    }

    if (!validUser) {
      validUser = await Admin.findOne({ email })
      if (validUser) {
        userRole = 'admin'
      }
    }

    // If no user is found in any model
    if (!validUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Password validation 
    const validPassword = bcryptjs.compareSync(password, validUser.password)
    if (!validPassword) {
      return NextResponse.json(
        { message: 'Invalid password' },
        { status: 400 }
      )
    }

    // Generate token and include role in the payload
    const token = jwt.sign({
      id: validUser._id,
      role: userRole
    }, process.env.JWT_SECRET_TOKEN, { expiresIn: '1d' })

    const { password: pass, ...rest } = validUser._doc 

    // Determine redirection based on the user role
    let redirectTo = ''
    switch (userRole) {
      case 'doctor':
        redirectTo = '/doctor-profile-info'
        break
      case 'user':
        redirectTo = '/'
        break
      case 'clinic':
        redirectTo = '/clinic-profile'
        break
      case 'admin':
        redirectTo = '/admin/dashboard'
        break
    }

    // Return success response with user data and token and redirection
    const ACCESS_TOKEN_TTL_MS = 24 * 60 * 60 * 1000
    
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: rest,
      redirectTo
    })
    
    response.cookies.set('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: ACCESS_TOKEN_TTL_MS,
      path: '/'
    })
    
    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Login failed. Please try again' },
      { status: 500 }
    )
  }
}