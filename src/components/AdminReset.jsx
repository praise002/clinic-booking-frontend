import { useState } from 'react'

import { request } from '../api.js'
import { resetErrorMessage } from '../messages.js'

// The reset example from the Koya contract (task-1.md).
const EXAMPLE = JSON.stringify(
  {
    slots: [
      { id: 's1', provider: 'Dr Ade', start: '2026-12-10T09:00:00Z', end: '2026-12-10T09:30:00Z' },
    ],
  },
  null,
  2,
)

export default function AdminReset({ onReset }) {
  const [apiKey, setApiKey] = useState('')
  const [slotsJson, setSlotsJson] = useState(EXAMPLE)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setError('')
    setDone(false)

    let body
    try {
      body = JSON.parse(slotsJson)
    } catch {
      setError("That isn't valid JSON.")
      return
    }
    if (!window.confirm('Are you sure? This deletes every booking.')) return

    setSending(true)
    // The typed key goes with this request; the proxy never adds its own key to /reset.
    const result = await request('POST', '/reset', { body, apiKey })
    setSending(false)
    if (!result.ok) {
      setError(resetErrorMessage(result))
      return
    }
    setDone(true)
    onReset()
  }

  return (
    <section>
      <h2>Admin</h2>
      <p className="muted">Replace every slot and delete every booking. Needs the API key.</p>
      <form onSubmit={submit} className="form">
        <label className="field">
          <span>API key</span>
          <input
            type="password"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            autoComplete="off"
          />
        </label>
        <label className="field">
          <span>Slots (JSON)</span>
          <textarea
            value={slotsJson}
            onChange={(event) => setSlotsJson(event.target.value)}
            rows={10}
            spellCheck={false}
            className="mono"
          />
        </label>
        {error && (
          <p className="message error" role="alert">
            {error}
          </p>
        )}
        {done && (
          <p className="message success" role="status">
            Slots replaced. Every booking was deleted.
          </p>
        )}
        <button type="submit" disabled={sending}>
          {sending ? 'Resetting…' : 'Reset'}
        </button>
      </form>
    </section>
  )
}
