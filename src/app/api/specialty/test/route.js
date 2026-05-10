import { NextResponse } from 'next/server'

// GET /api/specialty/test
export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: "Specialty API test endpoint working!" 
  })
}