import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import Specialty from '@/lib/models/specialty.model'
import { verifyAdmin } from '@/app/api/utils/verifyAdmin'

// POST /api/specialty/add
export async function POST(request) {
  try {
    await connectDB()
    
    // Verify admin
    const adminVerification = verifyAdmin(request)
    if (!adminVerification.success) {
      return NextResponse.json(
        { message: adminVerification.message },
        { status: 403 }
      )
    }

    const { name, treatments } = await request.json();
    if (!name || !treatments) {
      return NextResponse.json(
        { message: "Name and treatments are required." },
        { status: 400 }
      );
    }

    const specialty = new Specialty({ name, treatments });
    await specialty.save();

    return NextResponse.json({ 
      message: "Specialty added successfully.", 
      specialty 
    }, { status: 201 });
  } catch (error) {
    console.error("Error adding specialty:", error);
    return NextResponse.json(
      { message: "Failed to add specialty." },
      { status: 500 }
    );
  }
}