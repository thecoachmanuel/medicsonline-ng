import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import Review from '@/lib/models/review.model'
import mongoose from 'mongoose'

// GET /api/review/:doctorId
export async function GET(request, { params }) {
  try {
    await connectDB()
    
    const { doctorId } = params

    // Validate doctor ID format
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return NextResponse.json(
        { message: 'Invalid doctor ID format' },
        { status: 400 }
      )
    }

    // Find all reviews for the doctor and populate user details
    const reviews = await Review.find({ doctor: doctorId })
      .populate('user', 'firstName lastName') // Only select firstName and lastName from user
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order (newest first)

    return NextResponse.json({ success: true, reviews })
  } catch (error) {
    console.error("Error in getDoctorReviews:", error)
    return NextResponse.json(
      { message: 'Failed to fetch reviews.' },
      { status: 500 }
    )
  }
}