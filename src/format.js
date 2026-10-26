// Slot times in the patient's own timezone, e.g. "Thu 10 Dec 2026, 09:00–09:30".

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})
const timeFormat = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

function formatDate(date) {
  const part = Object.fromEntries(dateFormat.formatToParts(date).map((p) => [p.type, p.value]))
  return `${part.weekday} ${part.day} ${part.month} ${part.year}`
}

export function formatSlotTime(start, end) {
  const from = new Date(start)
  const to = new Date(end)
  const sameDay = formatDate(from) === formatDate(to)
  const ending = sameDay ? timeFormat.format(to) : `${formatDate(to)}, ${timeFormat.format(to)}`
  return `${formatDate(from)}, ${timeFormat.format(from)}–${ending}`
}

// The API's `available` only means "not booked". A slot that has started can't be booked
// either (the API would answer 400), so the page greys those out too.
export function isBookable(slot, now = new Date()) {
  return slot.available && new Date(slot.start) > now
}
