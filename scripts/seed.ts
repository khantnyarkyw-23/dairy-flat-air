import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI || 'mongodb+srv://khantnyarkyw_db_user:Khantnyar111@cluster0.fmnzjga.mongodb.net/dairyflatair?retryWrites=true&w=majority&appName=Cluster0'
const airports: Record<string, { name: string; timezone: string; offset: number }> = {
  NZNE: { name: 'Dairy Flat', timezone: 'Pacific/Auckland', offset: 12 },
  YSSY: { name: 'Sydney', timezone: 'Australia/Sydney', offset: 10 },
  NZRO: { name: 'Rotorua', timezone: 'Pacific/Auckland', offset: 12 },
  NZGB: { name: 'Great Barrier Island (Claris)', timezone: 'Pacific/Auckland', offset: 12 },
  NZCI: { name: 'Chatham Islands (Tuuta)', timezone: 'Pacific/Chatham', offset: 12.75 },
  NZTL: { name: 'Lake Tekapo', timezone: 'Pacific/Auckland', offset: 12 },
}

const aircraft: Record<string, { name: string; capacity: number }> = {
  SJ30I: { name: 'SyberJet SJ30i', capacity: 6 },
  SF50A: { name: 'Cirrus SF50 (Alpha)', capacity: 4 },
  SF50B: { name: 'Cirrus SF50 (Bravo)', capacity: 4 },
  HJEA:  { name: 'HondaJet Elite (Alpha)', capacity: 5 },
  HJEB:  { name: 'HondaJet Elite (Bravo)', capacity: 5 },
}

// Helper: given a date (NZ local) and a local hour/minute, return UTC Date
function toUTC(dateStr: string, localHour: number, localMin: number, offsetHours: number): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  const utcMs =
    Date.UTC(y, m - 1, d, localHour, localMin, 0) - offsetHours * 60 * 60 * 1000
  return new Date(utcMs)
}

function addMinutes(date: Date, mins: number): Date {
  return new Date(date.getTime() + mins * 60 * 1000)
}

// Generate YYYY-MM-DD strings for 10 weeks starting from today
function getDateRange(): string[] {
  const dates: string[] = []
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  for (let i = 0; i < 70; i++) {
    const d = new Date(start.getTime() + i * 86400000)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}

function dayOfWeek(dateStr: string): number {
  // 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).getDay()
}

let flightCounter = 1
function flightNum(prefix: string): string {
  return `${prefix}${String(flightCounter++).padStart(3, '0')}`
}

interface Schedule {
  flightNumber: string
  origin: string
  originName: string
  destination: string
  destinationName: string
  aircraft: string
  aircraftName: string
  capacity: number
  departureDateLocal: string
  departureUTC: Date
  arrivalUTC: Date
  durationMinutes: number
  price: number
  bookings: Booking[]
}

interface Booking {
  bookingRef: string
  passengerName: string
  passengerEmail: string
  passengerPhone: string
  bookedAt: Date
}

async function seed() {
  const client = new MongoClient(uri)
  await client.connect()
  console.log('Connected to MongoDB')

  const db = client.db('dairyflatair')
  await db.collection('schedules').deleteMany({})
  console.log('Cleared schedules collection')

  const dates = getDateRange()
  const schedules: Schedule[] = []

  for (const date of dates) {
    const dow = dayOfWeek(date)

    // ── SYDNEY (Prestige) ──────────────────────────────────────────
    // NZNE→YSSY: Friday 10:00 NZ (depart), ~3h30 westbound, arrives Sydney 13:30 Sydney time
    if (dow === 5) {
      const dep = toUTC(date, 10, 0, 12)
      schedules.push({
        flightNumber: 'DF001',
        origin: 'NZNE', originName: airports.NZNE.name,
        destination: 'YSSY', destinationName: airports.YSSY.name,
        aircraft: 'SJ30I', aircraftName: aircraft.SJ30I.name,
        capacity: aircraft.SJ30I.capacity,
        departureDateLocal: date,
        departureUTC: dep,
        arrivalUTC: addMinutes(dep, 210),
        durationMinutes: 210,
        price: 1200,
        bookings: [],
      })
    }
    // YSSY→NZNE: Sunday 14:00 Sydney time (~2h50 eastbound)
    if (dow === 0) {
      const dep = toUTC(date, 14, 0, 10)
      schedules.push({
        flightNumber: 'DF002',
        origin: 'YSSY', originName: airports.YSSY.name,
        destination: 'NZNE', destinationName: airports.NZNE.name,
        aircraft: 'SJ30I', aircraftName: aircraft.SJ30I.name,
        capacity: aircraft.SJ30I.capacity,
        departureDateLocal: date,
        departureUTC: dep,
        arrivalUTC: addMinutes(dep, 170),
        durationMinutes: 170,
        price: 1200,
        bookings: [],
      })
    }

    // ── ROTORUA Shuttle (Mon–Fri, twice daily) ─────────────────────
    if (dow >= 1 && dow <= 5) {
      // Morning: NZNE→NZRO 07:00, ~40min
      const dep1 = toUTC(date, 7, 0, 12)
      schedules.push({
        flightNumber: 'DF101',
        origin: 'NZNE', originName: airports.NZNE.name,
        destination: 'NZRO', destinationName: airports.NZRO.name,
        aircraft: 'SF50A', aircraftName: aircraft.SF50A.name,
        capacity: aircraft.SF50A.capacity,
        departureDateLocal: date,
        departureUTC: dep1,
        arrivalUTC: addMinutes(dep1, 40),
        durationMinutes: 40,
        price: 280,
        bookings: [],
      })
      // Morning return: NZRO→NZNE 09:00
      const dep2 = toUTC(date, 9, 0, 12)
      schedules.push({
        flightNumber: 'DF102',
        origin: 'NZRO', originName: airports.NZRO.name,
        destination: 'NZNE', destinationName: airports.NZNE.name,
        aircraft: 'SF50A', aircraftName: aircraft.SF50A.name,
        capacity: aircraft.SF50A.capacity,
        departureDateLocal: date,
        departureUTC: dep2,
        arrivalUTC: addMinutes(dep2, 40),
        durationMinutes: 40,
        price: 280,
        bookings: [],
      })
      // Afternoon: NZNE→NZRO 16:30
      const dep3 = toUTC(date, 16, 30, 12)
      schedules.push({
        flightNumber: 'DF103',
        origin: 'NZNE', originName: airports.NZNE.name,
        destination: 'NZRO', destinationName: airports.NZRO.name,
        aircraft: 'SF50A', aircraftName: aircraft.SF50A.name,
        capacity: aircraft.SF50A.capacity,
        departureDateLocal: date,
        departureUTC: dep3,
        arrivalUTC: addMinutes(dep3, 40),
        durationMinutes: 40,
        price: 280,
        bookings: [],
      })
      // Evening return: NZRO→NZNE 18:30
      const dep4 = toUTC(date, 18, 30, 12)
      schedules.push({
        flightNumber: 'DF104',
        origin: 'NZRO', originName: airports.NZRO.name,
        destination: 'NZNE', destinationName: airports.NZNE.name,
        aircraft: 'SF50A', aircraftName: aircraft.SF50A.name,
        capacity: aircraft.SF50A.capacity,
        departureDateLocal: date,
        departureUTC: dep4,
        arrivalUTC: addMinutes(dep4, 40),
        durationMinutes: 40,
        price: 280,
        bookings: [],
      })
    }

    // ── GREAT BARRIER ISLAND ───────────────────────────────────────
    // NZNE→NZGB: Mon/Wed/Fri 09:00, ~45min
    if (dow === 1 || dow === 3 || dow === 5) {
      const dep = toUTC(date, 9, 0, 12)
      schedules.push({
        flightNumber: 'DF201',
        origin: 'NZNE', originName: airports.NZNE.name,
        destination: 'NZGB', destinationName: airports.NZGB.name,
        aircraft: 'SF50B', aircraftName: aircraft.SF50B.name,
        capacity: aircraft.SF50B.capacity,
        departureDateLocal: date,
        departureUTC: dep,
        arrivalUTC: addMinutes(dep, 45),
        durationMinutes: 45,
        price: 320,
        bookings: [],
      })
    }
    // NZGB→NZNE: Tue/Thu/Sat 09:00
    if (dow === 2 || dow === 4 || dow === 6) {
      const dep = toUTC(date, 9, 0, 12)
      schedules.push({
        flightNumber: 'DF202',
        origin: 'NZGB', originName: airports.NZGB.name,
        destination: 'NZNE', destinationName: airports.NZNE.name,
        aircraft: 'SF50B', aircraftName: aircraft.SF50B.name,
        capacity: aircraft.SF50B.capacity,
        departureDateLocal: date,
        departureUTC: dep,
        arrivalUTC: addMinutes(dep, 45),
        durationMinutes: 45,
        price: 320,
        bookings: [],
      })
    }

    // ── CHATHAM ISLANDS ────────────────────────────────────────────
    // NZNE→NZCI: Tue/Fri 08:00 NZ, ~2h westbound
    if (dow === 2 || dow === 5) {
      const dep = toUTC(date, 8, 0, 12)
      schedules.push({
        flightNumber: 'DF301',
        origin: 'NZNE', originName: airports.NZNE.name,
        destination: 'NZCI', destinationName: airports.NZCI.name,
        aircraft: 'HJEA', aircraftName: aircraft.HJEA.name,
        capacity: aircraft.HJEA.capacity,
        departureDateLocal: date,
        departureUTC: dep,
        arrivalUTC: addMinutes(dep, 120),
        durationMinutes: 120,
        price: 890,
        bookings: [],
      })
    }
    // NZCI→NZNE: Wed/Sat 10:00 Chatham time (~1h45 eastbound)
    if (dow === 3 || dow === 6) {
      const dep = toUTC(date, 10, 0, 12.75)
      schedules.push({
        flightNumber: 'DF302',
        origin: 'NZCI', originName: airports.NZCI.name,
        destination: 'NZNE', destinationName: airports.NZNE.name,
        aircraft: 'HJEA', aircraftName: aircraft.HJEA.name,
        capacity: aircraft.HJEA.capacity,
        departureDateLocal: date,
        departureUTC: dep,
        arrivalUTC: addMinutes(dep, 105),
        durationMinutes: 105,
        price: 890,
        bookings: [],
      })
    }

    // ── LAKE TEKAPO ────────────────────────────────────────────────
    // NZNE→NZTL: Monday 10:00, ~1h15
    if (dow === 1) {
      const dep = toUTC(date, 10, 0, 12)
      schedules.push({
        flightNumber: 'DF401',
        origin: 'NZNE', originName: airports.NZNE.name,
        destination: 'NZTL', destinationName: airports.NZTL.name,
        aircraft: 'HJEB', aircraftName: aircraft.HJEB.name,
        capacity: aircraft.HJEB.capacity,
        departureDateLocal: date,
        departureUTC: dep,
        arrivalUTC: addMinutes(dep, 75),
        durationMinutes: 75,
        price: 540,
        bookings: [],
      })
    }
    // NZTL→NZNE: Tuesday 11:00, ~1h
    if (dow === 2) {
      const dep = toUTC(date, 11, 0, 12)
      schedules.push({
        flightNumber: 'DF402',
        origin: 'NZTL', originName: airports.NZTL.name,
        destination: 'NZNE', destinationName: airports.NZNE.name,
        aircraft: 'HJEB', aircraftName: aircraft.HJEB.name,
        capacity: aircraft.HJEB.capacity,
        departureDateLocal: date,
        departureUTC: dep,
        arrivalUTC: addMinutes(dep, 60),
        durationMinutes: 60,
        price: 540,
        bookings: [],
      })
    }
  }

  await db.collection('schedules').insertMany(schedules as any)
  console.log(`✅ Inserted ${schedules.length} scheduled flights`)

  await client.close()
  console.log('Done!')
}

seed().catch(console.error)