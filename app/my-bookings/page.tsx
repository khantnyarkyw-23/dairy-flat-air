'use client'

import { useState } from 'react'

interface Booking {
  _id: string
  reference: string
  passengerName: string
  passengerEmail: string
  passengerPhone?: string
  status: string
  flight: {
    flightNumber: string
    origin: string
    originName: string
    destination: string
    destinationName: string
    departureUTC: string
    arrivalUTC: string
    aircraftName: string
    price: number
  }
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleString('en-NZ', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function MyBookingsPage() {
  const [email, setEmail] = useState('')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')

  async function searchBookings(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setSearched(true)
    setError('')
    setBookings([])

    try {
      const res = await fetch(`/api/bookings?email=${encodeURIComponent(email)}`)
      const data = await res.json()

      if (Array.isArray(data)) {
        setBookings(data)
      } else {
        setError(data.error || 'Could not load bookings')
      }
    } catch {
      setError('Could not load bookings')
    }

    setLoading(false)
  }

  return (
    <>
      <section className="manage-hero">
        <div className="manage-hero-inner">
          <div className="hero-eyebrow">Manage Booking</div>
          <h1>Your Trips</h1>
          <p>
            View your confirmed flights, check itinerary details and manage your DairyFlat Air reservations.
          </p>
        </div>
      </section>

      <section className="section">
        <form onSubmit={searchBookings} className="manage-search-card">
          <div>
            <label>Email Address</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter the email used for booking"
              required
            />
          </div>

          <button className="btn-gold" type="submit">
            {loading ? 'Searching...' : 'Find My Trips'}
          </button>
        </form>

        {error && <p className="error-msg" style={{ textAlign: 'center' }}>{error}</p>}

        {searched && !loading && bookings.length === 0 && !error && (
          <div className="empty-booking-card">
            <div className="empty-plane">✈</div>
            <h2>No trips found</h2>
            <p>We could not find any confirmed DairyFlat Air flights for this email.</p>
          </div>
        )}
        {bookings.length > 0 && (
  <div
    style={{
      background: '#0B1E35',
      color: 'white',
      borderRadius: '20px',
      padding: '2rem',
      marginBottom: '2rem',
      textAlign: 'center'
    }}
  >
    <div style={{ fontSize: '12px', letterSpacing: '2px', color: '#b5841a' }}>
      UPCOMING JOURNEYS
    </div>

    <h2 style={{ marginTop: '10px' }}>
      {bookings.length} Confirmed Flight{bookings.length > 1 ? 's' : ''}
    </h2>

    <p style={{ opacity: 0.8 }}>
      Manage your itinerary and travel details below.
    </p>
  </div>
)}
        <div className="manage-booking-list">
          {bookings.map((b) => (
            <div key={b._id} className="trip-card">
              <div className="trip-card-header">
                <div>
                  <span>Booking Reference</span>
                  <strong>{b.reference}</strong>
                </div>

                <div className="trip-status">Confirmed</div>
              </div>

              <div className="trip-main">
                <div className="trip-airport">
                  <h2>{b.flight.origin}</h2>
                  <p>{b.flight.originName}</p>
                </div>

                <div className="trip-line">
                  <span></span>
                  <div>✈</div>
                  <span></span>
                </div>

                <div className="trip-airport">
                  <h2>{b.flight.destination}</h2>
                  <p>{b.flight.destinationName}</p>
                </div>
              </div>

              <div className="trip-details">
                <div>
                  <span>Passenger</span>
                  <strong>{b.passengerName}</strong>
                </div>

                <div>
                  <span>Flight</span>
                  <strong>{b.flight.flightNumber}</strong>
                </div>

                <div>
                  <span>Aircraft</span>
                  <strong>{b.flight.aircraftName}</strong>
                </div>

                <div>
                  <span>Departure</span>
                  <strong>{formatDateTime(b.flight.departureUTC)}</strong>
                </div>

                <div>
                  <span>Arrival</span>
                  <strong>{formatDateTime(b.flight.arrivalUTC)}</strong>
                </div>

                <div>
                  <span>Seat</span>
                  <strong>{b.reference.slice(-2)}A</strong>
                </div>
              </div>

              <div className="trip-footer">
                <div>
                  <span>Total Fare</span>
                  <strong>NZD {b.flight.price}</strong>
                </div>

                <div className="trip-actions">
                  <button
                    className="btn-outline"
                    onClick={() => window.location.href = `/confirmation?ref=${b.reference}`}
                  >
                    View Details
                  </button>

                  <button
                    className="btn-outline"
                    onClick={() => window.location.href = `/cancel?ref=${b.reference}`}
                  >
                    Cancel Booking
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}