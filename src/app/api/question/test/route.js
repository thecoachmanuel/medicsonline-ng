import { NextResponse } from 'next/server'

// GET /api/question/test
export async function GET() {
  return NextResponse.json({ message: 'Question API is working' })
}