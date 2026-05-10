import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import DoctorForm from '@/lib/models/doctorForm.model'
import { verifyAdmin } from '@/app/api/utils/verifyAdmin'

// PUT /api/admin/update-doctor-status/[doctorId]
export async function PUT(request, { params }) {
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
    
    const { doctorId } = params
    const { status } = await request.json()

    if (!status) {
      return NextResponse.json(
        { success: false, message: 'Status is required' },
        { status: 400 }
      )
    }

    const updatedDoctor = await DoctorForm.findByIdAndUpdate(
      doctorId,
      { planStatus: status },
      { new: true }
    ).select('-password')

    if (!updatedDoctor) {
      return NextResponse.json(
        { success: false, message: 'Doctor not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Doctor status updated successfully',
      doctor: updatedDoctor
    })
  } catch (error) {
    console.error('Error updating doctor status:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update doctor status' },
      { status: 500 }
    )
  }
}
