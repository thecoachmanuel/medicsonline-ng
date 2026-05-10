import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import Treatment from '@/lib/models/treatment.model'
import slugify from "slugify"
import { verifyAdmin } from '@/app/api/utils/verifyAdmin'

// POST /api/treatment/add
export async function POST(request) {
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

    const body = await request.json()
    const { name, description, specialties, images, sections, priceRange, priceByCity } = body

    if (!name) {
      return NextResponse.json(
        { message: "Treatment name is required." },
        { status: 400 }
      )
    }

    const slug = slugify(name, { lower: true })

    const treatment = new Treatment({
      name,
      slug,
      description,
      specialties,
      images: images || [],
      sections: sections || [],
      priceRange: priceRange || "",
      priceByCity: priceByCity || []
    })

    await treatment.save()

    return NextResponse.json({ 
      success: true, 
      message: "Treatment added successfully.", 
      treatment 
    }, { status: 201 })
  } catch (error) {
    console.error("Error in addTreatment:", error)
    return NextResponse.json(
      { message: 'Failed to add treatment.' },
      { status: 500 }
    )
  }
}