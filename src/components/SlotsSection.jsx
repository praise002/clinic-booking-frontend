import { useEffect, useState } from 'react'

import { request } from '../api.js'
import { formatSlotTime, isBookable } from '../format.js'
import { slotsErrorMessage } from '../messages.js'

export default function SlotsSection({ allSlots, loading, error, version, selectedSlot, onSelect }) {
  const [provider, setProvider] = useState('')
  const [filtered, setFiltered] = useState({ slots: [], loading: false, error: '' })

  // "All providers" shows the shared list; one provider asks the API for just theirs.
  useEffect(() => {
    if (!provider) return
    let current = true
    setFiltered((state) => ({ ...state, loading: true }))
    request('GET', '/slots', { query: { provider } }).then((result) => {
      if (!current) return
      setFiltered(
        result.ok
          ? { slots: result.data.slots, loading: false, error: '' }
          : { slots: [], loading: false, error: slotsErrorMessage(result) },
      )
    })
    return () => {
      current = false
    }
  }, [provider, version])

  const providers = [...new Set(allSlots.map((slot) => slot.provider))].sort()
  const view = provider ? filtered : { slots: allSlots, loading, error }
  const now = new Date()

  return (
    <section>
      <h2>Slots</h2>
      <label className="field">
        <span>Provider</span>
        <select value={provider} onChange={(event) => setProvider(event.target.value)}>
          <option value="">All providers</option>
          {providers.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>

      {view.error && (
        <p className="message error" role="alert">
          {view.error}
        </p>
      )}
      {view.loading && view.slots.length === 0 && <p className="muted">Loading…</p>}
      {!view.loading && !view.error && view.slots.length === 0 && (
        <p className="muted">{provider ? 'No slots for this provider.' : 'No slots yet.'}</p>
      )}

      {view.slots.length > 0 && (
        <ul className="rows">
          {view.slots.map((slot) => {
            const bookable = isBookable(slot, now)
            const selected = selectedSlot?.id === slot.id
            return (
              <li
                key={slot.id}
                className={`row${bookable ? '' : ' row-muted'}${selected ? ' row-selected' : ''}`}
              >
                <div>
                  <div className="row-title">{slot.provider}</div>
                  <div>{formatSlotTime(slot.start, slot.end)}</div>
                </div>
                {bookable ? (
                  <button
                    type="button"
                    className={selected ? 'button-secondary' : ''}
                    onClick={() => onSelect(slot)}
                    aria-pressed={selected}
                  >
                    {selected ? 'Selected' : 'Choose'}
                  </button>
                ) : (
                  <span className="label">Unavailable</span>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
