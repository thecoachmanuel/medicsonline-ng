import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import Question from '@/lib/models/question.model'
import DoctorForm from '@/lib/models/doctorForm.model'
import { errorHandler } from '@/app/api/utils/error'

// GET /api/stats
export async function GET() {
  try {
    await connectDB()
    
    // 1. Count the total number of questions asked
    const questionCount = await Question.countDocuments()

    // 2. Count the total number of answers provided by doctors
    const answerCount = await Question.aggregate([
      { $unwind: "$answers" },
      { $group: { _id: null, totalAnswers: { $sum: 1 } } },
    ])

    // 3. Count the total number of active doctors
    const doctorCount = await DoctorForm.countDocuments({ role: 'doctor' })

    // Send the stats response
    return NextResponse.json({
      success: true,
      stats: {
        questionsAsked: questionCount,
        answersProvided: answerCount[0]?.totalAnswers || 0, // Aggregate result
        doctorsSpecialists: doctorCount,
      },
    })
  } catch (err) {
    console.error(" Error fetching stats:", err)
    return NextResponse.json({ success: false, message: "Failed to fetch statistics." }, { status: 500 })
  }
}