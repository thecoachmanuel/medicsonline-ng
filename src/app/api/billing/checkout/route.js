import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import DoctorForm from '@/lib/models/doctorForm.model'

// POST /api/billing/checkout
export async function POST(request) {
  try {
    await connectDB()
    
    const { planId, cycle = "monthly", doctorId } = await request.json()
    
    if (!planId) {
      return NextResponse.json({ success: false, message: "Missing planId" }, { status: 400 })
    }
    
    if (!doctorId) {
      return NextResponse.json({ success: false, message: "Missing doctorId" }, { status: 400 })
    }

    const doctor = await DoctorForm.findById(doctorId)
    if (!doctor) {
      return NextResponse.json({ success: false, message: "Doctor not found" }, { status: 404 })
    }

    const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:7500"
    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY

    if (planId === "free") {
      await DoctorForm.findByIdAndUpdate(doctorId, {
        $set: {
          planId: "free",
          planCycle: null,
          planStatus: "active",
          currentPeriodEnd: null,
          paystackLastReference: null,
        },
      })
      return NextResponse.json({ success: true, url: `${CLIENT_URL}/doctor-profile-info` })
    }

    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json({ success: false, message: "Missing PAYSTACK_SECRET_KEY" }, { status: 500 })
    }

    function getPlanAmountKobo(planId, cycle) {
      const priceNgn = {
        plus: { monthly: 5000, yearly: 50000 },
        pro: { monthly: 10000, yearly: 100000 },
      }?.[planId]?.[cycle]

      if (!priceNgn) return null
      return Math.round(Number(priceNgn) * 100)
    }

    const amount = getPlanAmountKobo(planId, cycle)
    if (!amount) {
      return NextResponse.json({ success: false, message: "Unknown plan/cycle" }, { status: 400 })
    }

    const callbackUrl = `${CLIENT_URL}/doctor-profile-info?billing=paystack`
    const body = {
      email: doctor.email,
      amount,
      currency: "NGN",
      callback_url: callbackUrl,
      metadata: { planId, cycle, doctorId: String(doctorId) },
    }

    const psRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const psJson = await psRes.json().catch(() => null)
    if (!psRes.ok || !psJson?.status || !psJson?.data?.authorization_url) {
      return NextResponse.json({ success: false, message: psJson?.message || "Unable to start payment" }, { status: 500 })
    }

    await DoctorForm.findByIdAndUpdate(doctorId, {
      $set: {
        planId,
        planCycle: cycle,
        planStatus: "pending",
        paystackLastReference: psJson.data.reference || null,
      },
    })

    return NextResponse.json({ 
      success: true, 
      url: psJson.data.authorization_url, 
      reference: psJson.data.reference 
    })
  } catch (err) {
    return NextResponse.json({ success: false, message: err?.message || "Unable to start payment" }, { status: 500 })
  }
}
