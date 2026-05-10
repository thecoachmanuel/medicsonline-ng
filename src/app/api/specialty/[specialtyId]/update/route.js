import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import Specialty from '@/lib/models/specialty.model'
import mongoose from 'mongoose'
import { verifyAdmin } from '@/app/api/utils/verifyAdmin'

// PUT /api/specialty/:specialtyId/update
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

    const { specialtyId } = params
    const { name, treatments } = await request.json()

    // Validate specialty ID format
    if (!mongoose.Types.ObjectId.isValid(specialtyId)) {
      return NextResponse.json(
        { message: 'Invalid specialty ID format' },
        { status: 400 }
      )
    }

    const specialty = await Specialty.findByIdAndUpdate(
      specialtyId, 
      { name, treatments }, 
      { new: true }
    );
    if (!specialty) {
      return NextResponse.json(
        { message: "Specialty not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: "Specialty updated successfully.", 
      specialty 
    });
  } catch (error) {
    console.error("Error updating specialty:", error);
    return NextResponse.json(
      { message: "Failed to update specialty." },
      { status: 500 }
    );
  }
}