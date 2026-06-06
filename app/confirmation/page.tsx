'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'

function ConfirmationContent() {
  const params = useSearchParams()
  const router = useRouter()

  const ref = params.get('ref') || 'N/A'
  const flightRaw = params.get('flight')

  let flight: any = null

  try {
    flight = flightRaw ? JSON.parse(flightRaw) : null
  } catch {
    flight = null
  }

  return (
    <>
      <section className="confirm-hero">
        <div className="confirm-hero-overlay"></div>
        <div className="confirm-hero-content">
          <div className="hero-eyebrow">Booking confirmed</div>
          <h1>Your journey is ready</h1>
          <p>Thank you for flying with DairyFlat Air.</p>
        </div>
      </section>

      <section className="section">
        <div className="boarding-pass">
          <div className="boarding-pass-top">
            <div>
              <div className="section-label">Booking Reference</div>
              <div className="confirmation-ref">{ref}</div>
            </div>

            <div className="badge">Confirmed</div>
          </div>

          <div className="boarding-route">
            <div>
              <div className="invoice-airport">{flight?.origin || 'NZNE'}</div>
              <div className="invoice-city">{flight?.originName || 'Dairy Flat'}</div>
            </div>

            <div className="boarding-plane">✈</div>

            <div>
              <div className="invoice-airport">{flight?.destination || 'YSSY'}</div>
              <div className="invoice-city">{flight?.destinationName || 'Sydney'}</div>
            </div>
          </div>

          <div className="boarding-details">
            <div>
              <span>Flight</span>
              <strong>{flight?.flightNumber || 'DF001'}</strong>
            </div>
            <div>
              <span>Aircraft</span>
              <strong>{flight?.aircraftName || flight?.aircraft || 'SyberJet SJ30i'}</strong>
            </div>
            <div>
              <span>Departure</span>
              <strong>
                {flight?.departureUTC
                  ? new Date(flight.departureUTC).toLocaleString('en-NZ')
                  : '5 Jun 2026, 06:00'}
              </strong>
            </div>
            <div>
              <span>Arrival</span>
              <strong>
                {flight?.arrivalUTC
                  ? new Date(flight.arrivalUTC).toLocaleString('en-NZ')
                  : '5 Jun 2026, 09:30'}
              </strong>
            </div>
          </div>

          <div className="boarding-actions">
            <button className="btn-outline" onClick={() => router.push('/my-bookings')}>
              View My Bookings
            </button>

            <button className="btn-outline" onClick={() => router.push(`/cancel?ref=${ref}`)}>
              Cancel Booking
            </button>

            <button className="btn-outline" onClick={() => router.push('/')}>
              Book Another Flight
            </button>
          </div>
        </div>
      </section>
    </>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="section">Loading...</div>}>
      <ConfirmationContent />
    </Suspense>
  )
}