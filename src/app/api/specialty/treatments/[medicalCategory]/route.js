import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import Specialty from '@/lib/models/specialty.model'

// GET /api/specialty/treatments/:medicalCategory
export async function GET(request, { params }) {
  try {
    await connectDB()
    
    const { medicalCategory } = params;

    // Use case-insensitive search
    const specialty = await Specialty.findOne({ name: { $regex: new RegExp(`^${medicalCategory}$`, "i") } });

    if (!specialty) {
      return NextResponse.json(
        { success: false, message: "Specialty not found." },
        { status: 404 }
      );
    }

    if (!specialty.treatments || specialty.treatments.length === 0) {
      return NextResponse.json(
        { success: false, message: "No treatments found for this specialty." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, treatments: specialty.treatments });
  } catch (error) {
    console.error("Error fetching treatments:", error);
    return NextResponse.json(
      { message: "Failed to fetch treatments." },
      { status: 500 }
    );
  }
}