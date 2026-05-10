import { NextResponse } from 'next/server'

// GET /api/admin/test
export async function GET() {
  return NextResponse.json({ message: 'Admin API is working' })
}