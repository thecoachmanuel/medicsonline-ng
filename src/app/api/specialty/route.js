import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import Specialty from '@/lib/models/specialty.model'

// GET /api/specialty
export async function GET() {
  try {
    await connectDB()
    
    const specialties = await Specialty.find().populate('doctors', 'firstName lastName');

    return NextResponse.json({ success: true, specialties: specialties || [] })
  } catch (error) {
    console.error("Error fetching specialties:", error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch specialties' },
      { status: 500 }
    );
  }
}
