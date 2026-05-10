import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import Treatment from '@/lib/models/treatment.model'
import mongoose from 'mongoose'

// GET /api/treatment/slug/:slug
export async function GET(request, { params }) {
  try {
    await connectDB()
    
    const { slug } = params

    // Find treatment and populate specialties + doctors
    const treatment = await Treatment.findOne({ slug })
      .populate({
        path: "specialties",
        select: "name doctors",
        populate: {
          path: "doctors",
          select: "firstName lastName profilePicture specialty ratings city"
        }
      })
      .lean()

    if (!treatment) {
      return NextResponse.json(
        { success: false, message: "Treatment not found." },
        { status: 404 }
      )
    }

    // Collect all doctors from all specialties
    const allDoctors = treatment.specialties.flatMap(spec => spec.doctors || [])

    // Remove duplicates by ID
    const uniqueDoctors = []
    const seen = new Set()
    for (const doc of allDoctors) {
      const idStr = doc._id.toString()
      if (!seen.has(idStr)) {
        seen.add(idStr)
        uniqueDoctors.push(doc)
      }
    }

    return NextResponse.json({
      success: true,
      treatment,
      doctors: uniqueDoctors // flat array of doctors
    })
  } catch (error) {
    console.error("Error in getTreatmentBySlug:", error)
    return NextResponse.json(
      { message: 'Failed to fetch treatment and related doctors.' },
      { status: 500 }
    )
  }
}