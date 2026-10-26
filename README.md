# Clinic Booking — web page

One plain page for the [clinic booking API](../clinic-booking-api): see slots, book one and get the confirmation, find a booking by id, see all your bookings by email (10 at a time), cancel a booking, and (with the API key) reset the slots.

**Live:** https://clinic-booking-frontend-1pyf.vercel.app · **API:** https://clinic-booking-api-indol.vercel.app

## The API key never reaches the browser

The page only calls `/api/*` on its own origin. [`api/_proxy.js`](api/_proxy.js) forwards each call to the API and adds the server's key:

- **Patient requests** get the server's key, replacing anything the browser sent.
- **`POST /api/reset`** carries only the key typed into the Admin section, never the server's. Only someone who knows the key can wipe data.
- The API's status, body and `Retry-After` come back unchanged. Redirects are never followed, so the key can't be carried somewhere else. If the API can't be reached, the page gets `502 {"error": "booking service unreachable"}`.

The same `forward()` runs in production (the Vercel function [`api/proxy.js`](api/proxy.js), which `vercel.json` routes every `/api/*` request to) and in development (a small plugin in [`vite.config.js`](vite.config.js)). `API_BASE_URL` and `API_KEY` have no `VITE_` prefix, so Vite never puts them in the browser bundle.

## Run locally

Needs the API running (`clinic-booking-api`: `make up_build`, on http://localhost:8070).

```bash
cp .env.example .env.local   # set API_KEY to the API's key
npm install
npm run dev                  # http://localhost:5180
npm test                     # the proxy's key-handling rules
```

## Deploy (Vercel)

Vite preset; `api/proxy.js` becomes the serverless function, and `vercel.json` rewrites every `/api/<path>` to it (Vercel's `[...path]` catch-all only works in Next.js, so nested paths like `/api/bookings/<id>` would 404 without the rewrite). Set `API_BASE_URL` (the API's https URL) and `API_KEY` as environment variables.

```bash
npx vercel login
npx vercel link
npx vercel env add API_BASE_URL production
npx vercel env add API_KEY production
npx vercel deploy --prod
```

## Layout

```
api/_proxy.js          forward(): the key rules, shared by prod and dev
api/proxy.js           Vercel function; vercel.json rewrites every /api/* request to it
src/App.jsx            shared slot list, section order
src/api.js             fetch wrapper → {ok, status, data, retryAfter}
src/messages.js        API results → plain sentences
src/format.js          slot times in the browser's timezone
src/components/        Slots, Book a Slot, Find a Booking, My Bookings, Cancel, Admin
tests/proxy.test.js    node --test
```
