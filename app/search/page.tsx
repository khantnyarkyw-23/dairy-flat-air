'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'

interface Schedule {
  _id: string
  flightNumber: string
  origin: string
  originName: string
  destination: string
  destinationName: string
  aircraft: string
  aircraftName: string
  capacity: number
  departureUTC: string
  arrivalUTC: string
  durationMinutes: number
  price: number
  bookings: any[]
}

const AIRPORT_NAMES: Record<string, string> = {
  NZNE: 'Dairy Flat',
  YSSY: 'Sydney',
  NZRO: 'Rotorua',
  NZGB: 'Great Barrier Island',
  NZCI: 'Chatham Islands',
  NZTL: 'Lake Tekapo',
}

function formatDateTime(utc: string) {
  return new Date(utc).toLocaleString('en-NZ', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })
}

function formatTime(utc: string) {
  return new Date(utc).toLocaleTimeString('en-NZ', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDate(utc: string) {
  return new Date(utc).toLocaleDateString('en-NZ', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function SearchResults() {
  const params = useSearchParams()
  const router = useRouter()

  const orig = params.get('orig') || ''
  const dest = params.get('dest') || ''
  const date1 = params.get('date1') || ''
  const date2 = params.get('date2') || ''

  const [flights, setFlights] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!orig || !dest || !date1 || !date2) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    fetch(`/api/schedules?orig=${orig}&dest=${dest}&date1=${date1}&date2=${date2}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setFlights(data)
        } else {
          console.log('Schedule API response:', data)
          setError(data?.error || 'No flights found or API returned empty data')
          setFlights([])
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setError('Failed to load flights')
        setFlights([])
        setLoading(false)
      })
  }, [orig, dest, date1, date2])

  return (
    <>
      <div className="page-header">
        <h1>
          {AIRPORT_NAMES[orig] || orig || 'Origin'} → {AIRPORT_NAMES[dest] || dest || 'Destination'}
        </h1>
        <p>
          {date1 || 'Start date'} to {date2 || 'End date'}
        </p>
      </div>

      <div className="section">
        {loading && <p className="text-muted">Searching flights...</p>}

        {error && <p className="error-msg">{error}</p>}

        {!loading && flights.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✈️</div>
            <p
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 22,
                color: '#0B1E35',
              }}
            >
              No flights found
            </p>
            <p className="text-muted mt-1">Try a wider date range or different route.</p>
            <button className="btn-outline mt-3" onClick={() => router.push('/')}>
              Back to search
            </button>
          </div>
        )}

        {flights.map((f) => {
          const bookings = Array.isArray(f.bookings) ? f.bookings : []
          const seatsLeft = f.capacity - bookings.length
          const full = seatsLeft <= 0

          return (
            <div key={f._id} className="flight-card">
              <div>
                <div
                  style={{
                    fontSize: 12,
                    color: '#B5841A',
                    marginBottom: 8,
                    fontWeight: 500,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  {f.flightNumber} · {formatDate(f.departureUTC)}
                </div>

                <div className="flight-route">
                  <div>
                    <div className="flight-airport">{f.origin}</div>
                    <div className="flight-time">{formatTime(f.departureUTC)}</div>
                    <div style={{ fontSize: 12, color: '#6b6b6b' }}>{f.originName}</div>
                  </div>

                  <div className="flight-duration">
                    <div className="flight-line"></div>
                    <div>{f.durationMinutes}min</div>
                    <div className="flight-line"></div>
                  </div>

                  <div>
                    <div className="flight-airport">{f.destination}</div>
                    <div className="flight-time">{formatTime(f.arrivalUTC)}</div>
                    <div style={{ fontSize: 12, color: '#6b6b6b' }}>{f.destinationName}</div>
                  </div>
                </div>

                <div className="flight-meta">
                  <span>✈ {f.aircraftName}</span>
                  <span>🕐 {formatDateTime(f.departureUTC)}</span>
                </div>
              </div>

              <div className="flight-price-block">
                <div className="flight-price">NZD {f.price}</div>

                <div className="flight-seats">
                  {full ? '0 seats left' : `${seatsLeft} seat${seatsLeft > 1 ? 's' : ''} left`}
                </div>

                <span className={`badge ${full ? 'badge-full' : ''}`}>
                  {full ? 'Full' : 'Available'}
                </span>

                <div style={{ marginTop: 12 }}>
                  {!full ? (
                    <button className="btn-gold" onClick={() => router.push(`/book?id=${f._id}`)}>
                      Select
                    </button>
                  ) : (
                    <button
                      className="btn-outline"
                      disabled
                      style={{ opacity: 0.5, cursor: 'not-allowed' }}
                    >
                      Full
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {!loading && flights.length > 0 && (
          <div style={{ marginTop: '1.5rem' }}>
            <button className="btn-outline" onClick={() => router.push('/')}>
              ← Change search
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="section"><p className="text-muted">Loading...</p></div>}>
      <SearchResults />
    </Suspense>
  )
}