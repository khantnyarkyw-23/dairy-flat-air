'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'

interface Flight {
  _id: string
  flightNumber: string
  origin: string
  originName: string
  destination: string
  destinationName: string
  aircraftName: string
  departureUTC: string
  arrivalUTC: string
  durationMinutes: number
  price: number
  capacity: number
  bookings: any[]
}

function formatDate(utc: string) {
  return new Date(utc).toLocaleDateString('en-NZ', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
}

function formatTime(utc: string) {
  return new Date(utc).toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit' })
}

function BookingForm() {
  const params = useSearchParams()
  const router = useRouter()
  const id = params.get('id')

  const [flight, setFlight] = useState<Flight | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    if (!id) return
    fetch(`/api/schedules/single?id=${id}`)
      .then(r => r.json())
      .then(data => { setFlight(data); setLoading(false) })
      .catch(() => { setError('Flight not found'); setLoading(false) })
  }, [id])

  async function handleBook() {
    if (!name || !email) return setError('Please fill in your name and email')
    if (!email.includes('@')) return setError('Please enter a valid email')
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduleId: id, passengerName: name, passengerEmail: email.toLowerCase(), passengerPhone: phone }),
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error || 'Booking failed')
      router.push(`/confirmation?ref=${data.bookingRef}&flight=${encodeURIComponent(JSON.stringify(data.flight))}&passenger=${encodeURIComponent(JSON.stringify(data.passenger))}`)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#6b6b6b' }}>Loading flight details...</p>
    </div>
  )

  if (!flight) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#c0392b' }}>Flight not found.</p>
    </div>
  )

  const seatsLeft = flight.capacity - flight.bookings.length

  return (
    <>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0B1E35 0%, #1A3A60 100%)', padding: '3rem 2.5rem', color: 'white' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#B5841A', marginBottom: 12, fontWeight: 700 }}>Complete your booking</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 52, fontWeight: 300, color: '#F5EDD8' }}>{flight.origin}</div>
            <div style={{ color: '#B5841A' }}>
              <svg width="40" height="16" viewBox="0 0 40 16"><path d="M0 8h36M28 2l8 6-8 6" stroke="#B5841A" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
            </div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 52, fontWeight: 300, color: '#F5EDD8' }}>{flight.destination}</div>
          </div>
          <div style={{ display: 'flex', gap: '2rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, color: 'rgba(245,237,216,0.7)' }}>{formatDate(flight.departureUTC)}</span>
            <span style={{ fontSize: 14, color: 'rgba(245,237,216,0.7)' }}>{formatTime(flight.departureUTC)} → {formatTime(flight.arrivalUTC)}</span>
            <span style={{ fontSize: 14, color: 'rgba(245,237,216,0.7)' }}>{flight.flightNumber} · {flight.aircraftName}</span>
            <span style={{ fontSize: 14, color: '#B5841A', fontWeight: 600 }}>{seatsLeft} seats remaining</span>
          </div>
        </div>
      </div>

      {/* Form + Summary */}
      <div style={{ maxWidth: 1000, margin: '2.5rem auto', padding: '0 2.5rem', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>

        {/* Passenger Form */}
        <div>
          <div style={{ background: 'white', border: '1px solid #e5e5e5', borderRadius: 16, padding: '2rem', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#B5841A', fontWeight: 700, marginBottom: '1.5rem' }}>Passenger details</div>

            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b6b6b', marginBottom: 8, fontWeight: 600 }}>Full name *</label>
              <input
                type="text"
                placeholder="e.g. Jane Smith"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', fontSize: 15, border: '1px solid #e5e5e5', borderRadius: 10, fontFamily: 'DM Sans, sans-serif', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b6b6b', marginBottom: 8, fontWeight: 600 }}>Email address *</label>
              <input
                type="email"
                placeholder="e.g. jane@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', fontSize: 15, border: '1px solid #e5e5e5', borderRadius: 10, fontFamily: 'DM Sans, sans-serif', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b6b6b', marginBottom: 8, fontWeight: 600 }}>Phone number <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
              <input
                type="tel"
                placeholder="e.g. +64 21 123 4567"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', fontSize: 15, border: '1px solid #e5e5e5', borderRadius: 10, fontFamily: 'DM Sans, sans-serif', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {error && <p style={{ color: '#c0392b', fontSize: 14, marginBottom: '1rem' }}>{error}</p>}

            <button
              onClick={handleBook}
              disabled={submitting}
              style={{ width: '100%', padding: '16px', background: submitting ? '#9a6e12' : '#B5841A', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', letterSpacing: '0.03em' }}
            >
              {submitting ? 'Processing your booking...' : `Confirm booking — NZD ${flight.price}`}
            </button>

            <p style={{ fontSize: 12, color: '#6b6b6b', marginTop: 12, textAlign: 'center' }}>
              A unique booking reference will be issued immediately.
            </p>
          </div>

      <div className="features-grid">
      <div className="feature-card">
      <div className="feature-icon">✈</div>
      <div className="feature-title">Private Jet Comfort</div>
    <div className="feature-text">
          Spacious cabins, premium seating and personalized service.
        </div>
        </div>

      <div className="feature-card">
      <div className="feature-icon">◎</div>
      <div className="feature-title">Instant Booking</div>
      <div className="feature-text">
        Book your flight in seconds with immediate confirmation.
      </div>
      </div>

  <div className="feature-card">
    <div className="feature-icon">◈</div>
    <div className="feature-title">Exclusive Destinations</div>
    <div className="feature-text">
      Fly directly to unique locations across New Zealand and beyond.
    </div>
  </div>
</div> 
</div>

        {/* Summary */}
        <div style={{ background: '#0B1E35', borderRadius: 16, padding: '1.8rem', position: 'sticky', top: 90, height: 'fit-content' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#B5841A', fontWeight: 700, marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Flight summary</div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 36, fontWeight: 600, color: '#F5EDD8' }}>{flight.origin}</div>
              <div style={{ fontSize: 12, color: 'rgba(245,237,216,0.5)', marginTop: 2 }}>{flight.originName}</div>
              <div style={{ fontSize: 15, color: '#F5EDD8', marginTop: 6, fontWeight: 500 }}>{formatTime(flight.departureUTC)}</div>
            </div>
            <div style={{ paddingTop: 12, color: '#B5841A', fontSize: 20 }}>→</div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 36, fontWeight: 600, color: '#F5EDD8' }}>{flight.destination}</div>
              <div style={{ fontSize: 12, color: 'rgba(245,237,216,0.5)', marginTop: 2 }}>{flight.destinationName}</div>
              <div style={{ fontSize: 15, color: '#F5EDD8', marginTop: 6, fontWeight: 500 }}>{formatTime(flight.arrivalUTC)}</div>
            </div>
          </div>

          {[
            { label: 'Flight', value: flight.flightNumber },
            { label: 'Date', value: formatDate(flight.departureUTC) },
            { label: 'Aircraft', value: flight.aircraftName },
            { label: 'Duration', value: `${flight.durationMinutes} min` },
            { label: 'Seats left', value: `${seatsLeft} of ${flight.capacity}` },
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: '0.6rem', color: 'rgba(245,237,216,0.6)' }}>
              <span>{row.label}</span>
              <span style={{ color: '#F5EDD8', fontWeight: 500 }}>{row.value}</span>
            </div>
          ))}

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, color: 'rgba(245,237,216,0.7)', fontWeight: 600 }}>Total</span>
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, color: '#D4A848', fontWeight: 600 }}>NZD {flight.price}</span>
          </div>
        </div>
      </div>
    </>
  )
}

export default function BookPage() {
  return (
    <Suspense fallback={<div style={{ padding: '3rem', textAlign: 'center', color: '#6b6b6b' }}>Loading...</div>}>
      <BookingForm />
    </Suspense>
  )
}
