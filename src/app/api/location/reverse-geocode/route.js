import { NextResponse } from 'next/server'
import axios from 'axios'

// GET /api/location/reverse-geocode
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')

  try {
    if (!lat || !lon) {
      return NextResponse.json(
        { message: "Latitude and longitude are required" },
        { status: 400 }
      )
    }

    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
      params: {
        lat,
        lon,
        format: "json",
      },
      headers: {
        'User-Agent': 'medi-pulso 1.0 (support@medipulso.pl)',
      },
    })

    return NextResponse.json(response.data)
  } catch (error) {
    return NextResponse.json(
      { message: "Reverse geocoding failed", error: error.message },
      { status: 500 }
    )
  }
}