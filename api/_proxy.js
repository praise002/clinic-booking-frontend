// Forwards a browser request for /api/<path> to the booking API, adding the server's API key.
// Used by the Vercel function (api/[...path].js) in production and by the Vite dev server
// (vite.config.js) locally, so both run exactly this code.
// The leading underscore stops Vercel from deploying this file as a function of its own.

const REQUEST_HEADERS = ['content-type', 'idempotency-key']
const RESPONSE_HEADERS = ['content-type', 'retry-after']

// /reset carries only the key the admin typed, never the server's key, so only key holders
// can wipe data. Normalised so `/reset/` or `//Reset` can't slip past as a patient request.
function isReset(path) {
  return path.replace(/\/+/g, '/').replace(/\/$/, '').toLowerCase() === '/reset'
}

export async function forward(request, { apiBaseUrl, apiKey, fetchImpl = fetch }) {
  const url = new URL(request.url)
  const path = url.pathname.replace(/^\/api/, '') || '/'

  const headers = new Headers()
  for (const name of REQUEST_HEADERS) {
    const value = request.headers.get(name)
    if (value) headers.set(name, value)
  }
  if (isReset(path)) {
    const typedKey = request.headers.get('x-api-key')
    if (typedKey) headers.set('x-api-key', typedKey)
  } else {
    headers.set('x-api-key', apiKey ?? '')
  }

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD'
  let upstream
  try {
    upstream = await fetchImpl(`${(apiBaseUrl ?? '').replace(/\/$/, '')}${path}${url.search}`, {
      method: request.method,
      headers,
      body: hasBody ? await request.text() : undefined,
      // Never follow a redirect: it would carry the server key to wherever it points.
      redirect: 'manual',
    })
  } catch {
    return Response.json({ error: 'booking service unreachable' }, { status: 502 })
  }

  const responseHeaders = new Headers()
  for (const name of RESPONSE_HEADERS) {
    const value = upstream.headers.get(name)
    if (value) responseHeaders.set(name, value)
  }
  return new Response(await upstream.arrayBuffer(), {
    status: upstream.status,
    headers: responseHeaders,
  })
}
