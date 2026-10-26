// API results → short, plain sentences that say what to do next. Never raw JSON.

export const UNREACHABLE = "Couldn't reach the booking service, please try again."

// The API's 400 messages for a booking (bookings/pipes.py, bookings/exceptions.py).
const BOOKING_400 = {
  'name is required': 'Please enter your name.',
  'name must be a string': 'Please enter your name.',
  'email is required': 'Please enter your email.',
  'email must be a string': 'Please enter your email.',
  'email is not valid': "That email doesn't look right. Please check it and try again.",
  'slot_id is required': 'Please choose a slot first.',
  'slot_id must be a string': 'Please choose a slot first.',
  'slot has already started': 'This slot has already started. Please pick another.',
}

function unreachable(result) {
  return result.status === 0 || result.status === 502
}

// The chosen slot can't be booked any more, so the slot list should refresh.
export function slotIsGone(result) {
  return (
    result.status === 404 ||
    result.status === 409 ||
    (result.status === 400 && result.data?.error === 'slot has already started')
  )
}

export function bookingErrorMessage(result) {
  if (unreachable(result)) return UNREACHABLE
  if (result.status === 409) return 'Someone just booked this slot. Please pick another.'
  if (result.status === 404) return 'This slot no longer exists. Please pick another.'
  if (result.status === 400) {
    return BOOKING_400[result.data?.error] ?? 'Please check your details and try again.'
  }
  return "That booking didn't go through. Please try again."
}

export function lookupErrorMessage(result) {
  if (unreachable(result)) return UNREACHABLE
  if (result.status === 404) return 'No booking with that id.'
  return "Couldn't look that booking up. Please try again."
}

export function cancelErrorMessage(result) {
  if (unreachable(result)) return UNREACHABLE
  if (result.status === 409) return 'This booking is already cancelled.'
  if (result.status === 404) return 'No booking with that id.'
  return "The cancellation didn't go through. Please try again."
}

export function slotsErrorMessage(result) {
  if (unreachable(result)) return UNREACHABLE
  return "Couldn't load the slots. Please try again."
}

export function resetErrorMessage(result) {
  if (unreachable(result)) return UNREACHABLE
  if (result.status === 401) return 'Wrong API key.'
  if (result.status === 400) return `The slots weren't accepted: ${result.data?.error ?? 'bad input'}.`
  return "The reset didn't go through. Please try again."
}
