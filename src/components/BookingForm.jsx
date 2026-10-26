import { useEffect, useState } from 'react'

import { request } from '../api.js'
import { formatSlotTime } from '../format.js'
import { bookingErrorMessage, slotIsGone } from '../messages.js'
import BookingRow from './BookingRow.jsx'

export default function BookingForm({ slot, onBooked, onSlotsStale }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  // {booking, slot}: kept after the slot is deselected, until another slot is chosen.
  const [confirmation, setConfirmation] = useState(null)

  useEffect(() => {
    if (slot) {
      setConfirmation(null)
      setError('')
    }
  }, [slot])

  async function submit(event) {
    event.preventDefault()
    setSending(true)
    setError('')
    const result = await request('POST', '/bookings', {
      body: { slot_id: slot.id, name, email },
    })
    setSending(false)
    if (!result.ok) {
      // The inputs keep their values so the patient can correct and retry.
      setError(bookingErrorMessage(result))
      if (slotIsGone(result)) onSlotsStale()
      return
    }
    setConfirmation({ booking: result.data, slot })
    onBooked()
  }

  return (
    <section>
      <h2>Book a Slot</h2>

      {confirmation && (
        <div className="message success" role="status">
          <p className="row-title">You're booked. Keep your booking id to find it later.</p>
          <BookingRow booking={confirmation.booking} slot={confirmation.slot} />
        </div>
      )}

      {!slot && !confirmation && <p className="muted">Choose an available slot above.</p>}

      {slot && (
        // noValidate: the API is the one judge of the details, so every message comes from it.
        <form onSubmit={submit} className="form" noValidate>
          <p>
            <span className="row-title">{slot.provider}</span>
            <br />
            {formatSlotTime(slot.start, slot.end)}
          </p>
          <label className="field">
            <span>Name</span>
            <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
          </label>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
          </label>
          {error && (
            <p className="message error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" disabled={sending}>
            {sending ? 'Booking…' : 'Book'}
          </button>
        </form>
      )}
    </section>
  )
}
