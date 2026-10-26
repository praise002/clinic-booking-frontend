// The page's only way to talk to the API: same-origin /api/*, where the proxy adds the key.
// Never throws. Returns {ok, status, data, retryAfter}; status 0 means the request never
// got an answer (offline, DNS, CORS...).
export async function request(method, path, { body, query, apiKey } = {}) {
  const params = new URLSearchParams(
    Object.entries(query ?? {}).filter(([, value]) => value !== undefined && value !== ''),
  )
  const search = params.size ? `?${params}` : ''

  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (apiKey !== undefined) headers['X-API-Key'] = apiKey

  try {
    const response = await fetch(`/api${path}${search}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    let data = null
    try {
      data = await response.json()
    } catch {
      // Not JSON (or empty): leave data as null.
    }
    const retryAfter = response.headers.get('Retry-After')
    return {
      ok: response.ok,
      status: response.status,
      data,
      retryAfter: retryAfter === null ? null : Number(retryAfter),
    }
  } catch {
    return { ok: false, status: 0, data: null, retryAfter: null }
  }
}
