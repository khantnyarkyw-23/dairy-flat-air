import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ ref: string }> }
) {
  const { ref } = await params
  const client = await clientPromise
  const db = client.db('dairyflatair')

  const schedule = await db.collection('schedules').findOne({ 'bookings.bookingRef': ref })

  if (!schedule) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  await db.collection('schedules').updateOne(
    { 'bookings.bookingRef': ref },
    { $pull: { bookings: { bookingRef: ref } } as any }
  )

  return NextResponse.json({ success: true, message: `Booking ${ref} cancelled` })
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ref: string }> }
) {
  const { ref } = await params
  const client = await clientPromise
  const db = client.db('dairyflatair')

  const schedule = await db.collection('schedules').findOne({ 'bookings.bookingRef': ref })

  if (!schedule) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  const booking = schedule.bookings.find((b: any) => b.bookingRef === ref)

  return NextResponse.json({ booking, flight: schedule })
}