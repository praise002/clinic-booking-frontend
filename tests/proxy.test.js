// node --test: the key-handling rules of the proxy, with a fake upstream.
import assert from 'node:assert/strict'
import { test } from 'node:test'

import { forward } from '../api/_proxy.js'

const SERVER_KEY = 'server-key'

function fakeUpstream(response = new Response('{"ok":true}', { status: 200 })) {
  const calls = []
  const fetchImpl = async (url, init) => {
    calls.push({ url, init })
    return response
  }
  return { calls, fetchImpl }
}

function call(path, init = {}, upstream = fakeUpstream()) {
  const request = new Request(`http://page.test${path}`, init)
  return forward(request, {
    apiBaseUrl: 'http://api.test/',
    apiKey: SERVER_KEY,
    fetchImpl: upstream.fetchImpl,
  })
}

test('patient requests get the server key, replacing any key the browser sent', async () => {
  const upstream = fakeUpstream()
  await call('/api/bookings/abc?x=1', { headers: { 'X-API-Key': 'from-browser' } }, upstream)

  assert.equal(upstream.calls[0].url, 'http://api.test/bookings/abc?x=1')
  assert.equal(upstream.calls[0].init.headers.get('x-api-key'), SERVER_KEY)
})

test('reset carries only the typed key, never the server key', async () => {
  for (const path of ['/api/reset', '/api/reset/', '/api//Reset']) {
    const typed = fakeUpstream()
    await call(path, { method: 'POST', body: '{}', headers: { 'X-API-Key': 'typed' } }, typed)
    assert.equal(typed.calls[0].init.headers.get('x-api-key'), 'typed', path)

    const none = fakeUpstream()
    await call(path, { method: 'POST', body: '{}' }, none)
    assert.equal(none.calls[0].init.headers.get('x-api-key'), null, path)
  }
})

test('body, content type and Idempotency-Key are forwarded; redirects are not followed', async () => {
  const upstream = fakeUpstream()
  await call(
    '/api/bookings',
    {
      method: 'POST',
      body: '{"slot_id":"s1"}',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': 'k1' },
    },
    upstream,
  )

  const { init } = upstream.calls[0]
  assert.equal(init.body, '{"slot_id":"s1"}')
  assert.equal(init.headers.get('content-type'), 'application/json')
  assert.equal(init.headers.get('idempotency-key'), 'k1')
  assert.equal(init.redirect, 'manual')
})

test('status, body and Retry-After come back unchanged', async () => {
  const upstream = fakeUpstream(
    new Response('{"error":"too many"}', {
      status: 429,
      headers: { 'Content-Type': 'application/json', 'Retry-After': '42' },
    }),
  )
  const response = await call('/api/bookings', { method: 'POST', body: '{}' }, upstream)

  assert.equal(response.status, 429)
  assert.equal(response.headers.get('retry-after'), '42')
  assert.deepEqual(await response.json(), { error: 'too many' })
})

test('an unreachable API is a 502 in the error shape', async () => {
  const response = await forward(new Request('http://page.test/api/slots'), {
    apiBaseUrl: 'http://api.test',
    apiKey: SERVER_KEY,
    fetchImpl: async () => {
      throw new TypeError('fetch failed')
    },
  })

  assert.equal(response.status, 502)
  assert.deepEqual(await response.json(), { error: 'booking service unreachable' })
})
