import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import Treatment from '@/lib/models/treatment.model'
import mongoose from 'mongoose'
import { verifyAdmin } from '@/app/api/utils/verifyAdmin'

// PUT /api/treatment/:treatmentId/update
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

    const { treatmentId } = params
    const body = await request.json()
    const { name, description, specialties } = body

    // Validate treatment ID format
    if (!mongoose.Types.ObjectId.isValid(treatmentId)) {
      return NextResponse.json(
        { message: 'Invalid treatment ID format' },
        { status: 400 }
      )
    }

    const treatment = await Treatment.findByIdAndUpdate(
      treatmentId,
      { name, description, specialties },
      { new: true }
    );
    
    if (!treatment) {
      return NextResponse.json(
        { message: "Treatment not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "Treatment updated successfully.", 
      treatment 
    })
  } catch (error) {
    console.error("Error in updateTreatment:", error)
    return NextResponse.json(
      { message: 'Failed to update treatment.' },
      { status: 500 }
    )
  }
}