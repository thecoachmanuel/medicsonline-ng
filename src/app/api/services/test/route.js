import { NextResponse } from 'next/server'

// GET /api/services/test
export async function GET() {
  return NextResponse.json({ message: 'API is working' })
}