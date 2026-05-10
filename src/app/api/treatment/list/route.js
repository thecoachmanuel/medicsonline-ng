import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import Treatment from '@/lib/models/treatment.model'

// GET /api/treatment/list
export async function GET() {
  try {
    await connectDB()
    
    const treatments = await Treatment.find()
      .select("name slug") // only send what's needed for homepage links
      .lean()

    return NextResponse.json({ success: true, treatments: treatments || [] })
  } catch (error) {
    console.error("Error in getTreatmentsList:", error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch treatments list.' },
      { status: 500 }
    )
  }
}
