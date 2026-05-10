import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import Review from '@/lib/models/review.model'
import Doctor from '@/lib/models/doctorForm.model'
import mongoose from 'mongoose'
import { verifyUser } from '@/app/api/utils/verifyUser'

// POST /api/review/:doctorId/add
export async function POST(request, { params }) {
  try {
    await connectDB()
    
    // Verify user
    const userVerification = verifyUser(request)
    if (!userVerification.success) {
      return NextResponse.json(
        { message: userVerification.message },
        { status: 401 }
      )
    }
    
    const { doctorId } = params
    const { rating, comment } = await request.json()
    const userId = userVerification.user.id

    // Validate doctor ID format
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return NextResponse.json(
        { message: 'Invalid doctor ID format' },
        { status: 400 }
      )
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId)
    if (!doctor) {
      return NextResponse.json(
        { message: 'Doctor not found' },
        { status: 404 }
      )
    }

    // Check if user has already reviewed this doctor
    const existingReview = await Review.findOne({ user: userId, doctor: doctorId })
    if (existingReview) {
      return NextResponse.json(
        { message: 'You have already reviewed this doctor' },
        { status: 400 }
      )
    }

    // Create new review
    const newReview = new Review({
      user: userId,
      doctor: doctorId,
      rating,
      comment
    })

    await newReview.save()

    // Update doctor's ratings
    const reviews = await Review.find({ doctor: doctorId })
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / reviews.length

    await Doctor.findByIdAndUpdate(doctorId, {
      ratings: {
        average: averageRating,
        count: reviews.length
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: "Review added successfully.", 
      review: newReview 
    }, { status: 201 })
  } catch (error) {
    console.error("Error in addReview:", error)
    return NextResponse.json(
      { message: 'Failed to add review.' },
      { status: 500 }
    )
  }
}