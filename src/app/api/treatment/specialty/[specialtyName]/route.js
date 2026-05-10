import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import Treatment from '@/lib/models/treatment.model'

// GET /api/treatment/specialty/:specialtyName
export async function GET(request, { params }) {
  try {
    await connectDB()
    
    const { specialtyName } = params
    
    const treatments = await Treatment.find().populate({
      path: "specialties",
      match: { name: specialtyName }, // Filter by specialty name
    })

    const filteredTreatments = treatments
      .filter((treatment) => treatment.specialties.some((s) => s !== null))
      .map((treatment) => treatment.name)

    if (filteredTreatments.length === 0) {
      return NextResponse.json(
        { success: false, message: "No treatments found for this specialty." },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, treatments: filteredTreatments })
  } catch (error) {
    console.error("Error in getTreatmentsBySpecialty:", error)
    return NextResponse.json(
      { message: 'Failed to fetch treatments for specialty.' },
      { status: 500 }
    )
  }
}