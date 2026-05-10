import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import User from '@/lib/models/user.model'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'

// POST /api/auth/google
export async function POST(request) {
  try {
    await connectDB()
    
    const { name, email, googlePhotoUrl } = await request.json()

    // Check if user already exists
    const user = await User.findOne({ email })
    
    if (user) {
      // User exists, generate token
      const token = jwt.sign(
        { id: user._id, role: 'user' },
        process.env.JWT_SECRET_TOKEN,
        { expiresIn: '1d' }
      )
      
      const { password, ...rest } = user._doc
      
      const response = NextResponse.json({
        message: 'Login successful',
        user: rest,
        redirectTo: '/'
      })
      
      response.cookies.set('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
        path: '/'
      })
      return response
    } else {
      // User doesn't exist, create new user
      const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10)
      
      const newUser = new User({
        firstName: name.split(' ')[0],
        lastName: name.split(' ')[1] || '',
        email,
        password: hashedPassword,
        profilePicture: googlePhotoUrl,
        role: 'user'
      })
      
      await newUser.save()
      
      const token = jwt.sign(
        { id: newUser._id, role: 'user' },
        process.env.JWT_SECRET_TOKEN,
        { expiresIn: '1d' }
      )
      
      const { password, ...rest } = newUser._doc
      
      const response = NextResponse.json({
        message: 'Account created and login successful',
        user: rest,
        redirectTo: '/'
      })
      
      response.cookies.set('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
        path: '/'
      })
      return response
    }
  } catch (error) {
    console.error('Google auth error:', error)
    return NextResponse.json(
      { message: 'Google authentication failed' },
      { status: 500 }
    )
  }
}