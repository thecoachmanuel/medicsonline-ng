import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import Question from '@/lib/models/question.model'
import { verifyUserOrDoctor } from '@/app/api/utils/verifyUser'

// POST /api/question/answer/[questionId]
export async function POST(request, { params }) {
  try {
    await connectDB()
    
    // Verify user or doctor
    const userVerification = verifyUserOrDoctor(request)
    if (!userVerification.success) {
      return NextResponse.json(
        { message: userVerification.message },
        { status: 403 }
      )
    }
    
    const { questionId } = params
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ success: false, message: "Answer text is required." }, { status: 400 })
    }

    const question = await Question.findById(questionId)
    if (!question) {
      return NextResponse.json({ success: false, message: "Question not found." }, { status: 404 })
    }

    question.answers.push({
      doctor: userVerification.userId, // assuming auth middleware sets req.user
      text,
    })

    await question.save()

    return NextResponse.json({
      success: true,
      message: "Answer submitted successfully.",
      question,
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to submit answer." }, { status: 500 })
  }
}
