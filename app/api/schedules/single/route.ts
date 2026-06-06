import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  try {
    const client = await clientPromise
    const db = client.db('dairyflatair')
    const schedule = await db.collection('schedules').findOne({ _id: new ObjectId(id) })
    if (!schedule) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(schedule)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}