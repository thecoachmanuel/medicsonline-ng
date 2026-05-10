import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import Treatment from '@/lib/models/treatment.model'
import mongoose from 'mongoose'

// GET /api/treatment/:treatmentId
export async function GET(request, { params }) {
  try {
    await connectDB()
    
    const { treatmentId } = params
    
    // Validate treatment ID format
    if (!mongoose.Types.ObjectId.isValid(treatmentId)) {
      return NextResponse.json(
        { message: 'Invalid treatment ID format' },
        { status: 400 }
      )
    }

    const treatment = await Treatment.findById(treatmentId).populate("specialties", "name");
    
    if (!treatment) {
      return NextResponse.json(
        { success: false, message: "Treatment not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, treatment })
  } catch (error) {
    console.error("Error in getTreatmentById:", error)
    return NextResponse.json(
      { message: 'Failed to fetch treatment details.' },
      { status: 500 }
    )
  }
}