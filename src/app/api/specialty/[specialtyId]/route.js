import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import Specialty from '@/lib/models/specialty.model'
import mongoose from 'mongoose'

// GET /api/specialty/:specialtyId
export async function GET(request, { params }) {
  try {
    await connectDB()
    
    const { specialtyId } = params

    // Validate specialty ID format
    if (!mongoose.Types.ObjectId.isValid(specialtyId)) {
      return NextResponse.json(
        { message: 'Invalid specialty ID format' },
        { status: 400 }
      )
    }

    const specialty = await Specialty.findById(specialtyId).populate('doctors', 'name');
    if (!specialty) {
      return NextResponse.json(
        { message: "Failed to fetch specialty details." },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Specialty added successfully.", specialty })
  } catch (error) {
    console.error("Error fetching specialty details:", error);
    return NextResponse.json(
      { message: "Failed to fetch specialty details." },
      { status: 500 }
    )
  }
}