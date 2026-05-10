import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import Question from '@/lib/models/question.model'

// GET /api/question
export async function GET(request) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || 1
    const limit = searchParams.get('limit') || 10
    const unanswered = searchParams.get('unanswered')

    const query = {}

    // Optional filter for unanswered questions
    if (unanswered === "true") {
      query.answers = { $size: 0 }
    }

    const questions = await Question.find(query)
      .populate("user", "firstName lastName")
      .populate("answers.doctor", "firstName lastName profilePicture")
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })

    const total = await Question.countDocuments(query)

    return NextResponse.json({
      success: true,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalQuestions: total,
      questions,
    })
  } catch (error) {
    console.error("❌ Error in getAllQuestions:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch questions." }, { status: 500 })
  }
}
