// API results → short, plain sentences that say what to do next. Never raw JSON.

export const UNREACHABLE = "Couldn't reach the booking service, please try again."

function unreachable(result) {
  return result.status === 0 || result.status === 502
}

export function bookingErrorMessage(result) {
  if (unreachable(result)) return UNREACHABLE
  return "That booking didn't go through. Please try again."
}

export function lookupErrorMessage(result) {
  if (unreachable(result)) return UNREACHABLE
  if (result.status === 404) return 'No booking with that id.'
  return "Couldn't look that booking up. Please try again."
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
