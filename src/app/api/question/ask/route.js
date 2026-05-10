import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import Question from '@/lib/models/question.model'
import { verifyUserOrDoctor } from '@/app/api/utils/verifyUser'

// POST /api/question/ask
export async function POST(request) {
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
    
    const { questionText } = await request.json()

    if (!questionText) {
      return NextResponse.json({ success: false, message: "Question text is required." }, { status: 400 })
    }

    const newQuestion = new Question({
      user: userVerification.userId, 
      questionText,
    })

    await newQuestion.save()

    return NextResponse.json({
      success: true,
      message: "Question submitted successfully.",
      question: newQuestion,
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to submit question." }, { status: 500 })
  }
}
