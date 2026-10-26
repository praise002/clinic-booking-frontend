import { useEffect, useState } from 'react'

import { request } from '../api.js'
import { formatSlotTime } from '../format.js'
import { listErrorMessage } from '../messages.js'
import { CopyButton } from './BookingRow.jsx'
import CancelButton from './CancelButton.jsx'

const PAGE_SIZE = 10

export default function MyBookings({ allSlots, cancelledBooking, onCancelled }) {
  const [email, setEmail] = useState('')
  // The email the shown pages belong to (the input can change after a search).
  const [searchedEmail, setSearchedEmail] = useState('')
  const [page, setPage] = useState(null) // {bookings, next_cursor}
  const [pageNumber, setPageNumber] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function load(forEmail, cursor, number) {
    setLoading(true)
    setError('')
    const result = await request('GET', '/bookings', {
      query: { email: forEmail, limit: PAGE_SIZE, cursor },
    })
    setLoading(false)
    if (!result.ok) {
      setError(listErrorMessage(result))
      return
    }
    setPage(result.data)
    setPageNumber(number)
  }

  function submit(event) {
    event.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) {
      setError('Please enter your email.')
      return
    }
    setSearchedEmail(trimmed)
    load(trimmed, undefined, 1)
  }

  function replaceBooking(updated) {
    setPage((current) =>
      current && {
        ...current,
        bookings: current.bookings.map((b) => (b.id === updated.id ? updated : b)),
      },
    )
  }

  function handleCancelled(updated, notice) {
    replaceBooking(updated)
    setError(notice)
    onCancelled(updated)
  }

  // Cancelled in another section of the page: show this row as it is now.
  useEffect(() => {
    if (cancelledBooking) replaceBooking({ ...cancelledBooking, status: 'cancelled' })
  }, [cancelledBooking])

  return (
    <section>
      <h2>My Bookings</h2>
      <form onSubmit={submit} className="inline-form" noValidate>
        <label className="field grow">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
          />
        </label>
        <button type="submit" disabled={loading}>
          Show my bookings
        </button>
      </form>

      {loading && <p className="muted">Loading…</p>}
      {error && (
        <p className="message error" role="alert">
          {error}
        </p>
      )}

      {page && page.bookings.length === 0 && pageNumber === 1 && (
        <p className="muted">No bookings for this email.</p>
      )}

      {page && page.bookings.length > 0 && (
        <>
          <p className="muted">
            Page {pageNumber} · oldest first · {searchedEmail.toLowerCase()}
          </p>
          <ul className="rows">
            {page.bookings.map((booking) => {
              const slot = allSlots.find((s) => s.id === booking.slot_id)
              const cancelled = booking.status === 'cancelled'
              return (
                <li key={booking.id} className={`row${cancelled ? ' row-muted' : ''}`}>
                  <div className="row-main">
                    <div className="row-title">
                      {slot ? formatSlotTime(slot.start, slot.end) : 'Slot no longer listed'}
                      {slot && <span className="row-sub"> · {slot.provider}</span>}
                    </div>
                    <div className="row-id">
                      <code>{booking.id}</code>
                      <CopyButton text={booking.id} />
                    </div>
                  </div>
                  <div className="row-side">
                    <span className={`label${cancelled ? '' : ' label-success'}`}>
                      {booking.status}
                    </span>
                    {!cancelled && (
                      <CancelButton booking={booking} onCancelled={handleCancelled} compact />
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
          {page.next_cursor && (
            <div className="actions">
              <button
                type="button"
                className="button-secondary"
                disabled={loading}
                onClick={() => load(searchedEmail, page.next_cursor, pageNumber + 1)}
              >
                Next page
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}
