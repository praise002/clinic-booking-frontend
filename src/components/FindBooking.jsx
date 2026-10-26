import { useState } from 'react'

import { request } from '../api.js'
import { lookupErrorMessage } from '../messages.js'
import BookingRow from './BookingRow.jsx'

export default function FindBooking({ allSlots }) {
  const [bookingId, setBookingId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [booking, setBooking] = useState(null)

  async function submit(event) {
    event.preventDefault()
    const id = bookingId.trim()
    if (!id) return
    setLoading(true)
    setError('')
    setBooking(null)
    const result = await request('GET', `/bookings/${encodeURIComponent(id)}`)
    setLoading(false)
    if (!result.ok) {
      setError(lookupErrorMessage(result))
      return
    }
    setBooking(result.data)
  }

  const slot = booking && allSlots.find((s) => s.id === booking.slot_id)

  return (
    <section>
      <h2>Find a Booking</h2>
      <form onSubmit={submit} className="inline-form">
        <label className="field grow">
          <span>Booking id</span>
          <input
            value={bookingId}
            onChange={(event) => setBookingId(event.target.value)}
            spellCheck={false}
            className="mono"
          />
        </label>
        <button type="submit" disabled={loading}>
          Find
        </button>
      </form>
      {loading && <p className="muted">Loading…</p>}
      {error && (
        <p className="message error" role="alert">
          {error}
        </p>
      )}
      {booking && <BookingRow booking={booking} slot={slot} />}
    </section>
  )
}
