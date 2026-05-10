import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import DoctorForm from '@/lib/models/doctorForm.model'

// POST /api/billing/verify
export async function POST(request) {
  try {
    await connectDB()
    
    const { reference } = await request.json()
    
    if (!reference) {
      return NextResponse.json({ success: false, message: "Missing reference" }, { status: 400 })
    }
    
    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json({ success: false, message: "Missing PAYSTACK_SECRET_KEY" }, { status: 500 })
    }

    const psRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
    })
    
    const psJson = await psRes.json().catch(() => null)
    if (!psRes.ok || !psJson?.status) {
      return NextResponse.json({ success: false, message: psJson?.message || "Unable to verify payment" }, { status: 500 })
    }

    const data = psJson.data
    const metadata = data?.metadata || {}
    const doctorId = metadata?.doctorId
    const planId = metadata?.planId
    const cycle = metadata?.cycle

    if (!doctorId || !planId) {
      return NextResponse.json({ success: false, message: "Missing metadata" }, { status: 400 })
    }

    if (data?.status !== "success") {
      await DoctorForm.findByIdAndUpdate(doctorId, {
        $set: { planStatus: "failed", paystackLastReference: reference },
      })
      return NextResponse.json({ success: false, message: "Payment not successful" })
    }

    function computePeriodEnd(cycle) {
      const now = Date.now()
      const days = cycle === "yearly" ? 365 : 30
      return new Date(now + days * 24 * 60 * 60 * 1000)
    }

    await DoctorForm.findByIdAndUpdate(doctorId, {
      $set: {
        planId,
        planCycle: cycle || null,
        planStatus: "active",
        currentPeriodEnd: computePeriodEnd(cycle),
        paystackLastReference: reference,
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ success: false, message: err?.message || "Unable to verify payment" }, { status: 500 })
  }
}