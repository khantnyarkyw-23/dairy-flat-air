import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const orig = searchParams.get('orig')
  const dest = searchParams.get('dest')
  const date1 = searchParams.get('date1')
  const date2 = searchParams.get('date2')

  if (!orig || !dest || !date1 || !date2) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  }

  try {
    const client = await clientPromise
    const db = client.db('dairyflatair')

    const from = new Date(date1)
    from.setHours(0, 0, 0, 0)
    const to = new Date(date2)
    to.setHours(23, 59, 59, 999)

    const schedules = await db.collection('schedules').find({
      origin: orig,
      destination: dest,
      departureUTC: { $gte: from, $lte: to },
    }).sort({ departureUTC: 1 }).toArray()

    return NextResponse.json(schedules)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}