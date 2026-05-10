import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import Treatment from '@/lib/models/treatment.model'

// GET /api/treatment
export async function GET() {
  try {
    await connectDB()
    
    const treatments = await Treatment.find().populate("specialties", "name")
    
    if (!treatments || treatments.length === 0) {
      return NextResponse.json(
        { success: false, message: "No treatments found." },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, treatments })
  } catch (error) {
    console.error("Error in getTreatments:", error)
    return NextResponse.json(
      { message: 'Failed to fetch treatments.' },
      { status: 500 }
    )
  }
}