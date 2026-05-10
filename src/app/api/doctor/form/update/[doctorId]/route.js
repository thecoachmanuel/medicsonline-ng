import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import DoctorForm from '@/lib/models/doctorForm.model'
import jwt from 'jsonwebtoken'

// PUT /api/doctor/form/update/:doctorId
export async function PUT(request, { params }) {
  try {
    await connectDB()
    
    const { doctorId } = params
    const body = await request.json()
    
    // Get token from cookies to verify user
    const token = request.cookies.get('access_token')?.value
    
    if (!token) {
      return NextResponse.json(
        { message: 'You are not authorized to perform this action' },
        { status: 403 }
      )
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN)
    
    // Check if user is authorized (doctor or admin)
    if (decoded.role !== 'doctor' && decoded.role !== 'admin') {
      return NextResponse.json(
        { message: 'You are not authorized to perform this action' },
        { status: 403 }
      )
    }

    const updatedDoctor = await DoctorForm.findByIdAndUpdate(
      doctorId,
      {
        $set: {
          firstName: body.firstName,
          lastName: body.lastName,
          phoneNumber: body.phoneNumber,
          gender: body.gender,
          dateOfBirth: body.dateOfBirth,
          medicalCategory: body.medicalCategory,
          medicalSpecialtyCategory: body.medicalSpecialtyCategory,
          specialty: body.specialty,
          officeInformation: body.officeInformation,
          city: body.city,
          profilePicture: body.profilePicture,
          priceList: body.priceList,
          location: body.location,
          address: body.address,
          zipcode: body.zipcode,
          paymentMethods: body.paymentMethods,
          onlineConsultation: body.onlineConsultation,
          languages: body.languages,
          instagram: body.instagram,
          acceptChildren: body.acceptChildren,
          customTreatments: body.customTreatments,
          profileCompletion: body.profileCompletion,
        },
      },
      { new: true }
    ).select('-password')
    
    if (!updatedDoctor) {
      return NextResponse.json(
        { message: 'Doctor not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(updatedDoctor)
  } catch (error) {
    console.error('Error updating doctor profile:', error)
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 401 }
      )
    }
    if (error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { message: 'Token expired' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { message: 'Failed to update doctor information' },
      { status: 500 }
    )
  }
}