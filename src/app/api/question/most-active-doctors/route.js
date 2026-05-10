import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import Question from '@/lib/models/question.model'
import Doctor from '@/lib/models/doctorForm.model'
import moment from 'moment'

// GET /api/question/most-active-doctors
export async function GET() {
  try {
    await connectDB()
    
    const thirtyDaysAgo = moment().subtract(30, "days").toDate() // Date 30 days ago

    const activeDoctors = await Question.aggregate([
      {
        $unwind: "$answers", // Unwind the answers array
      },
      {
        $match: {
          "answers.createdAt": { $gte: thirtyDaysAgo }, // Filter answers from the last 30 days
        },
      },
      {
        $group: {
          _id: "$answers.doctor", // Group by doctor
          answersCount: { $sum: 1 }, // Count the number of answers for each doctor
        },
      },
      {
        $sort: { answersCount: -1 }, // Sort by the number of answers in descending order
      },
      {
        $limit: 5, // Show the top 5 most active doctors (you can adjust this)
      },
      {
        $lookup: {
          from: "doctorforms", // Assuming the doctor model is "doctorforms"
          localField: "_id",
          foreignField: "_id",
          as: "doctorDetails",
        },
      },
      {
        $unwind: "$doctorDetails", // Unwind to get a single doctor object
      },
      {
        $project: {
          doctorId: "$_id",
          answersCount: 1,
          doctorName: {
            $concat: ["$doctorDetails.firstName", " ", "$doctorDetails.lastName"],
          },
          profilePicture: "$doctorDetails.profilePicture",
          specialty: "$doctorDetails.medicalSpecialtyCategory",
          city: "$doctorDetails.city",
        },
        // city: "$doctorDetails.city",
      },
    ])

    return NextResponse.json({
      success: true,
      activeDoctors,
    })
  } catch (err) {
    console.error("Error in getMostActiveDoctors:", err)
    return NextResponse.json({ success: false, message: "Failed to fetch most active doctors." }, { status: 500 })
  }
}