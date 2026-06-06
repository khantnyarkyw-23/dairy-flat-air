import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  const client = await clientPromise
  const db = client.db('dairyflatair')

  const schedules = await db.collection('schedules').find({
    'bookings.passengerEmail': email.toLowerCase(),
  }).sort({ departureUTC: 1 }).toArray()

  const results = schedules.map((s) => {
    const booking = s.bookings.find((b: any) => b.passengerEmail === email.toLowerCase())
    return {
      bookingRef: booking.bookingRef,
      passengerName: booking.passengerName,
      bookedAt: booking.bookedAt,
      flight: {
        _id: s._id,
        flightNumber: s.flightNumber,
        origin: s.origin,
        originName: s.originName,
        destination: s.destination,
        destinationName: s.destinationName,
        departureUTC: s.departureUTC,
        arrivalUTC: s.arrivalUTC,
        aircraftName: s.aircraftName,
        price: s.price,
        seatsLeft: s.capacity - s.bookings.length,
      },
    }
  })

  return NextResponse.json(results)
}