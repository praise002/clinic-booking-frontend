import { useState } from 'react'

import { request } from '../api.js'
import { cancelErrorMessage } from '../messages.js'

// Cancels one confirmed booking after an "are you sure?". When the booking ends up
// cancelled (here, or already in another tab) it calls onCancelled(booking, notice) so the
// owner can update the row; the notice outlives this button, which disappears with the
// confirmed status.
export default function CancelButton({ booking, onCancelled, compact = false }) {
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  async function cancel() {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return
    setSending(true)
    setError('')
    const result = await request('DELETE', `/bookings/${encodeURIComponent(booking.id)}`)
    setSending(false)
    if (result.ok) {
      onCancelled(result.data, '')
    } else if (result.status === 409) {
      onCancelled({ ...booking, status: 'cancelled' }, cancelErrorMessage(result))
    } else {
      setError(cancelErrorMessage(result))
    }
  }

  return (
    <div className={compact ? 'actions actions-compact' : 'actions'}>
      <button
        type="button"
        className={`button-secondary${compact ? ' button-small' : ''}`}
        onClick={cancel}
        disabled={sending}
      >
        {sending ? 'Cancelling…' : compact ? 'Cancel' : 'Cancel booking'}
      </button>
      {error && (
        <p className="message error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
