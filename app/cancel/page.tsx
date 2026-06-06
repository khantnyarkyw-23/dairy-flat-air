'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

function CancelContent() {
  const params = useSearchParams()
  const initialRef = params.get('ref') || ''

  const [reference, setReference] = useState(initialRef)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCancel() {
    if (!reference) {
      setMessage('Please enter a booking reference')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const res = await fetch(`/api/bookings/${reference}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (res.ok) {
        setMessage('Booking cancelled successfully')
      } else {
        setMessage(data.error || 'Unable to cancel booking')
      }
    } catch {
      setMessage('Server error')
    }

    setLoading(false)
  }

  return (
    <>
      <section className="cancel-hero">
        <div>
          <div className="hero-eyebrow">Manage Booking</div>
          <h1>Cancel your flight</h1>
          <p>Enter your booking reference to cancel your DairyFlat Air reservation.</p>
        </div>
      </section>

      <section className="section">
        <div className="cancel-card-premium">
          <div className="cancel-icon">✈</div>

          <h2>Booking Cancellation</h2>
          <p className="text-muted">
            Once cancelled, your seat will be released back into availability.
          </p>

          <div className="cancel-form">
            <label>Booking Reference</label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value.toUpperCase())}
              placeholder="DF-XXXXXX"
            />

            <button onClick={handleCancel} disabled={loading} className="btn-gold">
              {loading ? 'Cancelling...' : 'Cancel Booking'}
            </button>
          </div>

          {message && (
            <div className={message.includes('successfully') ? 'cancel-success' : 'cancel-error'}>
              {message}
            </div>
          )}
        </div>
      </section>
    </>
  )
}

export default function CancelPage() {
  return (
    <Suspense fallback={<div className="section">Loading...</div>}>
      <CancelContent />
    </Suspense>
  )
}