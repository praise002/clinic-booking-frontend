// Vercel function for every /api/* request: the page's only way to reach the booking API.
// API_BASE_URL and API_KEY are server-side Vercel env vars; neither ever reaches the browser.
import { forward } from './_proxy.js'

function handle(request) {
  return forward(request, { apiBaseUrl: process.env.API_BASE_URL, apiKey: process.env.API_KEY })
}

export { handle as GET, handle as POST, handle as DELETE }
