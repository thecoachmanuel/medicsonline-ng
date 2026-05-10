import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import DoctorForm from '@/lib/models/doctorForm.model'

// GET /api/doctor/form/random-doctors
export async function GET() {
  try {
    await connectDB()
    
    // Fetch 6 random doctors
    const randomDoctors = await DoctorForm.aggregate([
      { $sample: { size: 6 } },  // Get 6 random doctors
      {
        $lookup: {
          from: 'reviews',  // Reference the reviews collection
          localField: '_id',  // Match doctor ID
          foreignField: 'doctor',  // Match doctor in reviews
          as: 'reviews'  // Name the field to store reviews
        }
      },
      {
        $unwind: {
          path: '$reviews',  // Unwind the reviews array (this ensures only one review is shown)
          preserveNullAndEmptyArrays: true  // Keep doctors with no reviews
        }
      },
      {
        $sort: {
          'reviews.createdAt': -1  // Sort by most recent review
        }
      },
      {
        $group: {
          _id: '$_id',  // Group by doctor ID
          firstName: { $first: '$firstName' },
          lastName: { $first: '$lastName' },
          profilePicture: { $first: '$profilePicture' },
          city: { $first: '$city' },
          medicalCategory: { $first: '$medicalCategory' },
          latestReview: { $first: '$reviews' },  // Get the latest review
        }
      },
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          profilePicture: 1,
          city: 1,
          medicalCategory: 1,
          latestReview: {
            comment: 1,
            rating: 1,
            user: 1,  // Include the user that gave the review
          }
        }
      }
    ])

    return NextResponse.json({
      success: true,
      doctors: randomDoctors,
    })
  } catch (error) {
    console.error('Error fetching random doctors:', error)
    return NextResponse.json(
      { message: 'Failed to fetch random doctors.' },
      { status: 500 }
    )
  }
}