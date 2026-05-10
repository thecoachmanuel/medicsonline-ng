import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import DoctorForm from '@/lib/models/doctorForm.model'
import User from '@/lib/models/user.model'
import Clinic from '@/lib/models/clinic.model'
import Admin from '@/lib/models/admin.model'
import jwt from 'jsonwebtoken'

// GET /api/auth/session
export async function GET(request) {
  try {
    await connectDB()
    
    // Get token from cookies
    const token = request.cookies.get('access_token')?.value
    
    if (!token) {
      return NextResponse.json(
        { 
          success: false,
          code: 'NO_TOKEN',
          message: 'No token found, please login' 
        },
        { status: 401 }
      )
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN)
    const { id, role, exp } = decoded

    let model = null
    switch (role) {
      case 'doctor':
        model = DoctorForm
        break
      case 'user':
        model = User
        break
      case 'clinic':
        model = Clinic
        break
      case 'admin':
        model = Admin
        break
      default:
        return NextResponse.json(
          {
            success: false,
            code: 'FORBIDDEN_ROLE',
            message: 'Forbidden - Unknown role',
          },
          { status: 403 }
        )
    }

    const doc = await model.findById(id).lean()
    if (!doc) {
      // User removed or mismatch
      return NextResponse.json(
        {
          success: false,
          code: 'TOKEN_INVALID',
          message: 'Unauthorized - Account not found',
        },
        { status: 401 }
      )
    }
    
    // Remove password from response
    const { password, ...safe } = doc

    return NextResponse.json({
      success: true,
      role,
      user: safe,
      exp, // seconds since epoch (from JWT)
      sessionExpiresAt: exp * 1000, // ms epoch, convenient for UI timers
      serverTimeMs: Date.now(), 
    })
  } catch (error) {
    console.error('Session error:', error)
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        {
          success: false,
          code: 'TOKEN_INVALID',
          message: 'Invalid token',
        },
        { status: 401 }
      )
    }
    if (error.name === 'TokenExpiredError') {
      return NextResponse.json(
        {
          success: false,
          code: 'TOKEN_EXPIRED',
          message: 'Token expired',
        },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { message: 'Session validation failed' },
      { status: 500 }
    )
  }
}