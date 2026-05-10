import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import Question from '@/lib/models/question.model'

// GET /api/question/answered-latest
export async function GET(request) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') || 10

    // Find questions that have at least one answer, sorted by latest answer
    const questions = await Question.find({ "answers.0": { $exists: true } })
      .populate("user", "firstName lastName")
      .populate("answers.doctor", "firstName lastName profilePicture")
      .limit(parseInt(limit))
      .sort({ createdAt: -1 }) // Sort by question creation date (most recent first)
      .lean()

    return NextResponse.json({
      success: true,
      questions,
    })
  } catch (error) {
    console.error("❌ Error in getAnsweredQuestions:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch answered questions." }, { status: 500 })
  }
}
