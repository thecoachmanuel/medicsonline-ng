import { NextResponse } from 'next/server'

// GET /api/location/test
export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: "Location API test endpoint working!" 
  })
}