import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

function generateRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let ref = 'DF-'
  for (let i = 0; i < 6; i++) {
    ref += chars[Math.floor(Math.random() * chars.length)]
  }
  return ref
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { scheduleId, passengerName, passengerEmail, passengerPhone } = body

  if (!scheduleId || !passengerName || !passengerEmail) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const client = await clientPromise
  const db = client.db('dairyflatair')

  const schedule = await db.collection('schedules').findOne({ _id: new ObjectId(scheduleId) })

  if (!schedule) return NextResponse.json({ error: 'Flight not found' }, { status: 404 })
  if ((schedule.bookings || []).length >= schedule.capacity) {
    return NextResponse.json({ error: 'Flight is full' }, { status: 409 })
  }

  const bookingRef = generateRef()
  const booking = {
    bookingRef,
    passengerName,
    passengerEmail,
    passengerPhone: passengerPhone || '',
    bookedAt: new Date(),
  }

  await db.collection('schedules').updateOne(
    { _id: new ObjectId(scheduleId) },
    { $push: { bookings: booking } as any }
  )

  return NextResponse.json({
    success: true,
    bookingRef,
    flight: {
      flightNumber: schedule.flightNumber,
      origin: schedule.origin,
      originName: schedule.originName,
      destination: schedule.destination,
      destinationName: schedule.destinationName,
      departureUTC: schedule.departureUTC,
      arrivalUTC: schedule.arrivalUTC,
      aircraft: schedule.aircraftName,
      price: schedule.price,
    },
    passenger: { passengerName, passengerEmail, passengerPhone },
  })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')

  if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

  const client = await clientPromise
  const db = client.db('dairyflatair')

  const schedules = await db.collection('schedules')
    .find({ 'bookings.passengerEmail': email }).toArray()

  const bookings = schedules.flatMap((s: any) =>
    (s.bookings || [])
      .filter((b: any) => b.passengerEmail === email)
      .map((b: any) => ({
        _id: `${s._id}-${b.bookingRef}`,
        reference: b.bookingRef,
        passengerName: b.passengerName,
        passengerEmail: b.passengerEmail,
        passengerPhone: b.passengerPhone || '',
        flight: {
          flightNumber: s.flightNumber,
          origin: s.origin,
          originName: s.originName,
          destination: s.destination,
          destinationName: s.destinationName,
          departureUTC: s.departureUTC,
          arrivalUTC: s.arrivalUTC,
          aircraftName: s.aircraftName,
          price: s.price,
        },
      }))
  )

  return NextResponse.json(bookings)
}