'use client'

import { useState } from 'react'

export default function FlightStatusPage() {
  const [flightNumber, setFlightNumber] = useState('')
  const [flights, setFlights] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function checkStatus() {
    if (!flightNumber.trim()) return
    setLoading(true)
    setSearched(false)
    try {
      const res = await fetch(`/api/flight-status?fn=${flightNumber.toUpperCase()}`)
      const data = await res.json()
      setFlights(data)
      setSearched(true)
    } catch {
      setFlights([])
      setSearched(true)
    } finally {
      setLoading(false)
    }
  }

  function formatDateTime(utc: string) {
    return new Date(utc).toLocaleString('en-NZ', {
      weekday: 'short', day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
    })
  }

  return (
    <>
      <div className="page-header">
        <h1>Flight Status</h1>
        <p>Check departure times and status for any DairyFlat Air flight.</p>
      </div>

      <div className="section" style={{ maxWidth: 600 }}>
        <div className="form-card">
          <h2>Track a flight</h2>
          <div className="form-group">
            <label>Flight Number</label>
            <input
              value={flightNumber}
              onChange={e => setFlightNumber(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && checkStatus()}
              placeholder="e.g. DF001, DF101, DF201"
              style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}
            />
          </div>
          <p style={{ fontSize: 12, color: '#6b6b6b', marginBottom: 12 }}>
            Valid flights: DF001, DF002, DF101–DF104, DF201, DF202, DF301, DF302, DF401, DF402
          </p>
          <button className="btn-gold" onClick={checkStatus} disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Searching...' : 'Check Status'}
          </button>
        </div>

        {searched && flights.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b6b6b' }}>
            No upcoming flights found for <strong>{flightNumber}</strong>.
          </div>
        )}

        {flights.map((f, i) => (
          <div key={i} className="flight-card mt-2" style={{ marginTop: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: '#B5841A', marginBottom: 8, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {f.flightNumber} · {f.seatsLeft} seats left
              </div>
              <div className="flight-route">
                <div>
                  <div className="flight-airport">{f.origin}</div>
                  <div style={{ fontSize: 12, color: '#6b6b6b' }}>{f.originName}</div>
                </div>
                <div className="flight-duration">
                  <div className="flight-line"></div>
                  <div>✈</div>
                  <div className="flight-line"></div>
                </div>
                <div>
                  <div className="flight-airport">{f.destination}</div>
                  <div style={{ fontSize: 12, color: '#6b6b6b' }}>{f.destinationName}</div>
                </div>
              </div>
              <div className="flight-meta">
                <span>📅 {formatDateTime(f.departureUTC)}</span>
                <span>✈ {f.aircraftName}</span>
              </div>
            </div>
            <div className="flight-price-block">
              <div className="flight-price">NZD {f.price}</div>
              <div style={{ marginTop: 8 }}>
                <span className={`badge ${f.seatsLeft === 0 ? 'badge-full' : ''}`}>
                  {f.seatsLeft === 0 ? 'Full' : 'Available'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}