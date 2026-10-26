import { useState } from 'react'

import { formatSlotTime } from '../format.js'

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard blocked: the id is still selectable on screen.
    }
  }

  return (
    <button type="button" className="button-secondary button-small" onClick={copy}>
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

// One booking: the id first (it's the handle for finding it again), then the details.
// `slot` comes from the page's slot list; it can be missing after a reset.
// `children` holds actions for the row, such as the cancel button.
export default function BookingRow({ booking, slot, children }) {
  const cancelled = booking.status === 'cancelled'

  return (
    <div className={`booking${cancelled ? ' row-muted' : ''}`}>
      <div className="booking-id">
        <span className="muted">Booking id</span>
        <code>{booking.id}</code>
        <CopyButton text={booking.id} />
      </div>
      <dl className="details">
        <dt>Provider</dt>
        <dd>{slot ? slot.provider : 'Slot no longer listed'}</dd>
        <dt>Time</dt>
        <dd>{slot ? formatSlotTime(slot.start, slot.end) : '—'}</dd>
        <dt>Name</dt>
        <dd>{booking.name}</dd>
        <dt>Email</dt>
        <dd>{booking.email}</dd>
        <dt>Status</dt>
        <dd>
          <span className={`label${cancelled ? '' : ' label-success'}`}>{booking.status}</span>
        </dd>
      </dl>
      {children}
    </div>
  )
}
