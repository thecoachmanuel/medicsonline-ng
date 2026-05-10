import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import DoctorForm from '@/lib/models/doctorForm.model'
import DoctorAvailability from '@/lib/models/doctorAvailability.model'

// GET /api/doctor/form/search
export async function GET(request) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const specialty = searchParams.get('specialty')
    const location = searchParams.get('location')
    const onlineConsultation = searchParams.get('onlineConsultation')
    const availability = searchParams.get('availability')

    if (!specialty && !location && onlineConsultation === null && !availability) {
      return NextResponse.json(
        { message: 'Please provide at least a location, specialty, online consultation filter, or availability filter.' },
        { status: 400 }
      )
    }

    // Create a dynamic query object
    let searchQuery = {}
    if (specialty) searchQuery.medicalCategory = specialty
    if (location) searchQuery.city = location
    if (onlineConsultation !== null) searchQuery.onlineConsultation = onlineConsultation === 'true'

    // Fetch matching doctors from DoctorForm
    let doctors = await DoctorForm.find(searchQuery).select(
      'firstName lastName medicalCategory gender medicalSpecialtyCategory officeInformation city profilePicture priceList location address zipcode paymentMethods onlineConsultation languages instagram acceptChildren'
    )

    if (!doctors.length) {
      return NextResponse.json(
        { success: false, message: 'No doctors found for the selected criteria.' },
        { status: 404 }
      )
    }

    // Apply availability filter if provided
    if (availability) {
      // Convert the date to ISO format
      const formattedDate = new Date(availability).toISOString().split('T')[0]

      // Find available doctors from DoctorAvailability
      const availableDoctors = await DoctorAvailability.find({
        'monthlyAvailability.dates.date': new Date(formattedDate) // Ensure proper date format
      }).select('doctor')

      if (!availableDoctors.length) {
        return NextResponse.json(
          { success: false, message: 'No doctors found with the selected availability.' },
          { status: 404 }
        )
      }

      // Filter doctors who match availability
      const availableDoctorIds = availableDoctors.map((doc) => doc.doctor.toString())
      doctors = doctors.filter((doctor) => availableDoctorIds.includes(doctor._id.toString()))

      if (!doctors.length) {
        return NextResponse.json(
          { success: false, message: 'No doctors found with the selected availability.' },
          { status: 404 }
        )
      }
    }

    return NextResponse.json({ success: true, doctors })
  } catch (error) {
    console.error('Error searching for doctors:', error)
    return NextResponse.json(
      { message: 'Failed to fetch doctors.' },
      { status: 500 }
    )
  }
}