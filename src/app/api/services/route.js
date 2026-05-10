import { NextResponse } from 'next/server'

// GET /api/services
export async function GET() {
  try {
    const services = [
      {
        name: "Teeth Whitening",
        locations: ["Krakow", "Wroclaw", "Warsaw", "Poznan"]
      },
      {
        name: "Ultrasound",
        locations: ["Krakow", "Wroclaw", "Warsaw", "Poznan"]
      },
      {
        name: "Rehabilitation",
        locations: ["Krakow", "Wroclaw", "Warsaw", "Poznan"]
      },
      {
        name: "Massage",
        locations: ["Krakow", "Wroclaw", "Warsaw", "Poznan"]
      },
      {
        name: "Abdominal ultrasound",
        locations: ["Krakow", "Wroclaw", "Warsaw", "Poznan"]
      },
      {
        name: "Echo of the heart",
        locations: ["Krakow", "Wroclaw", "Warsaw", "Poznan"]
      },
      {
        name: "Holter ekg",
        locations: ["Krakow", "Wroclaw", "Warsaw", "Poznan"]
      },
      {
        name: "Computed tomography",
        locations: ["Krakow", "Wroclaw", "Warsaw", "Poznan"]
      },
      {
        name: "Spirometry",
        locations: ["Krakow", "Wroclaw", "Warsaw", "Poznan"]
      },
      {
        name: "Prenatal tests",
        locations: ["Krakow", "Wroclaw", "Warsaw", "Poznan"]
      },
      {
        name: "Colonoscopy",
        locations: ["Krakow", "Wroclaw", "Warsaw", "Poznan"]
      },
      {
        name: "Endoscopy",
        locations: ["Krakow", "Wroclaw", "Warsaw", "Poznan"]
      },
      {
        name: "Magnetic resonance",
        locations: ["Krakow", "Wroclaw", "Warsaw", "Poznan"]
      },
      {
        name: "Laser hair removal",
        locations: ["Krakow", "Wroclaw", "Warsaw", "Poznan"]
      },
    ]
    return NextResponse.json({ services })
  } catch (error) {
    console.error('Failed to get services:', error)
    return NextResponse.json({ message: 'Failed to get services', error: error.message }, { status: 500 })
  }
}