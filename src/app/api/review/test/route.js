import { NextResponse } from 'next/server'

// GET /api/review/test
export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: "Review API test endpoint working!" 
  })
}