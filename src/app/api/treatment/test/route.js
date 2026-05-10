import { NextResponse } from 'next/server'

// GET /api/treatment/test
export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: "Treatment API test endpoint working!" 
  })
}