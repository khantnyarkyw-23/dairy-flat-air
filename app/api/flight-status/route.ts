import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const fn = searchParams.get('fn')
  if (!fn) return NextResponse.json({ error: 'Missing flight number' }, { status: 400 })

  try {
    const client = await clientPromise
    const db = client.db('dairyflatair')
    const now = new Date()
    const schedules = await db.collection('schedules').find({
      flightNumber: fn,
      departureUTC: { $gte: now }
    }).sort({ departureUTC: 1 }).limit(5).toArray()

    const result = schedules.map(s => ({
      ...s,
      seatsLeft: s.capacity - (s.bookings || []).length
    }))

    return NextResponse.json(result)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}