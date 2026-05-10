import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import DoctorForm from '@/lib/models/doctorForm.model'

// POST /api/billing/downgrade
export async function POST(request) {
  try {
    await connectDB()
    
    const { doctorId } = await request.json()
    
    if (!doctorId) {
      return NextResponse.json({ success: false, message: "Missing doctorId" }, { status: 400 })
    }

    await DoctorForm.findByIdAndUpdate(doctorId, {
      $set: {
        planId: "free",
        planCycle: null,
        planStatus: "active",
        currentPeriodEnd: null,
        paystackLastReference: null,
      },
    })

    return NextResponse.json({ success: true, message: "Downgraded to free plan" })
  } catch (err) {
    return NextResponse.json({ success: false, message: err?.message || "Unable to downgrade to free plan" }, { status: 500 })
  }
}