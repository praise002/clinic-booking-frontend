import { useCallback, useEffect, useState } from 'react'

import { request } from './api.js'
import AdminReset from './components/AdminReset.jsx'
import BookingForm from './components/BookingForm.jsx'
import FindBooking from './components/FindBooking.jsx'
import SlotsSection from './components/SlotsSection.jsx'
import { slotsErrorMessage } from './messages.js'

export default function App() {
  // The unfiltered slot list: feeds the provider dropdown and the slot lookups for bookings.
  const [allSlots, setAllSlots] = useState([])
  const [slotsLoading, setSlotsLoading] = useState(true)
  const [slotsError, setSlotsError] = useState('')
  // Bumped on every refresh so a filtered slot list re-fetches too.
  const [slotsVersion, setSlotsVersion] = useState(0)
  const [selectedSlot, setSelectedSlot] = useState(null)
  // The latest booking cancelled anywhere on the page, so every view of it can follow.
  const [cancelledBooking, setCancelledBooking] = useState(null)

  const refreshSlots = useCallback(async () => {
    setSlotsLoading(true)
    const result = await request('GET', '/slots')
    setSlotsLoading(false)
    if (!result.ok) {
      setSlotsError(slotsErrorMessage(result))
      return
    }
    setSlotsError('')
    setAllSlots(result.data.slots)
    setSlotsVersion((version) => version + 1)
  }, [])

  useEffect(() => {
    refreshSlots()
  }, [refreshSlots])

  function handleBooked() {
    setSelectedSlot(null)
    refreshSlots()
  }

  function handleCancelled(booking) {
    setCancelledBooking(booking)
    refreshSlots()
  }

  return (
    <main className="page">
      <header>
        <h1>Clinic Booking</h1>
        <p className="muted">Pick a free slot, book it, and find or check your booking later.</p>
      </header>

      <SlotsSection
        allSlots={allSlots}
        loading={slotsLoading}
        error={slotsError}
        version={slotsVersion}
        selectedSlot={selectedSlot}
        onSelect={setSelectedSlot}
      />
      <BookingForm
        slot={selectedSlot}
        onBooked={handleBooked}
        onSlotsStale={refreshSlots}
        cancelledBooking={cancelledBooking}
      />
      <FindBooking allSlots={allSlots} onCancelled={handleCancelled} />
      <AdminReset onReset={refreshSlots} />
    </main>
  )
}
