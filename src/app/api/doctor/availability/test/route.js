import { NextResponse } from 'next/server'

// GET /api/doctor/availability/test
export async function GET() {
  return NextResponse.json({ message: 'API is working' })
}