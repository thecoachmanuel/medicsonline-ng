import { NextResponse } from 'next/server'

// GET /api/doctor/form/test
export async function GET() {
  return NextResponse.json({ message: 'API is working' })
}