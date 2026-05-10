import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import Treatment from '@/lib/models/treatment.model'
import mongoose from 'mongoose'
import { verifyAdmin } from '@/app/api/utils/verifyAdmin'

// PUT /api/treatment/:treatmentId/images
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
    const { images = [], mode = 'append' } = body

    // Validate treatment ID format
    if (!mongoose.Types.ObjectId.isValid(treatmentId)) {
      return NextResponse.json(
        { message: 'Invalid treatment ID format' },
        { status: 400 }
      )
    }

    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { message: 'Body must include a non-empty array "images".' },
        { status: 400 }
      )
    }

    const treatment = await Treatment.findById(treatmentId);
    if (!treatment) {
      return NextResponse.json(
        { message: 'Treatment not found' },
        { status: 404 }
      );
    }

    if (!Array.isArray(treatment.images)) treatment.images = []

    if (mode === 'replace') {
      treatment.images = images
    } else if (mode === 'remove') {
      const toRemove = new Set(images)
      treatment.images = treatment.images.filter(u => !toRemove.has(u))
    } else { // append (default)
      const merged = [...treatment.images, ...images]
      const seen = new Set()
      treatment.images = merged.filter(u => (seen.has(u) ? false : (seen.add(u), true)))
    }

    await treatment.save()

    return NextResponse.json({ treatmentId: treatment._id, images: treatment.images })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { message: 'Failed to update treatment images' },
      { status: 500 }
    )
  }
}