import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import DoctorForm from '@/lib/models/doctorForm.model'
import { verifyAdmin } from '@/app/api/utils/verifyAdmin'

// GET /api/admin/all-doctors
export async function GET(request) {
  try {
    await connectDB()
    
    // Verify admin
    const adminVerification = verifyAdmin(request)
    if (!adminVerification.success) {
      return NextResponse.json(
        { message: adminVerification.message },
        { status: 403 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    const query = {}
    
    // Add search filter if provided
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }
    
    // Add status filter if provided
    if (status) {
      query.planStatus = status
    }

    const doctors = await DoctorForm.find(query)
      .select('-password')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })

    const total = await DoctorForm.countDocuments(query)

    return NextResponse.json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalDoctors: total,
      doctors
    })
  } catch (error) {
    console.error('Error fetching doctors:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch doctors' },
      { status: 500 }
    )
  }
}