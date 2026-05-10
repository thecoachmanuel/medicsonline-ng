import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import Doctor from '@/lib/models/doctorForm.model'
import Review from '@/lib/models/review.model'

// GET /api/review/doctors-with-latest-reviews
export async function GET() {
  try {
    await connectDB()
    
    // Use aggregation pipeline to get doctors with their latest review
    const doctorsWithLatestReview = await Doctor.aggregate([
      {
        $lookup: {
          from: "reviews",  // The collection to join with
          localField: "_id",  // Field from the doctors collection
          foreignField: "doctor",  // Field from the reviews collection
          as: "reviews"  // The array field that will contain the joined reviews
        }
      },
      {
        $match: {
          "reviews.0": { $exists: true }  // Only include doctors who have at least one review
        }
      },
      {
        $addFields: {
          latestReview: {
            $arrayElemAt: [
              {
                $sortArray: {
                  input: "$reviews",
                  sortBy: { createdAt: -1 }  // Sort reviews by createdAt in descending order
                }
              },
              0  // Get the first (latest) review after sorting
            ]
          }
        }
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          profilePicture: 1,
          specialty: 1,
          ratings: 1,
          city: 1,
          latestReview: {
            comment: 1,
            rating: 1,
            createdAt: 1,
            user: { firstName: 1, lastName: 1 }  // Select the firstName and lastName of the user
          }
        }
      },
      {
        $limit: 3  // Limit to 3 doctors for testing
      }
    ]);

    // Send the response with the doctors and their latest review
    return NextResponse.json({
      success: true,
      doctors: doctorsWithLatestReview,
    });
  } catch (error) {
    console.error("Error in getDoctorsWithLatestReview:", error);
    return NextResponse.json(
      { message: 'Failed to fetch doctors with latest reviews.' },
      { status: 500 }
    );
  }
}