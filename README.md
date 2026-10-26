# Clinic Booking — web page

One plain page for the clinic booking API: see slots, book one, get the confirmation, look a booking up, and (with the API key) reset the slots.

The browser never sees the API key. The page only calls `/api/*` on its own origin; `api/_proxy.js` forwards each call to the API and adds the server's key. `POST /api/reset` is the exception: it carries only the key typed into the Admin section.

## Run locally

Needs the API running (`clinic-booking-api`, `docker compose up`, on http://localhost:8070).

```bash
cp .env.example .env.local   # set API_KEY to the API's key
npm install
npm run dev                  # http://localhost:5180
npm test                     # proxy key-handling tests
```

`API_BASE_URL` and `API_KEY` have no `VITE_` prefix, so Vite never puts them in the browser bundle. In dev, `vite.config.js` runs `/api/*` through the same `forward()` the Vercel function uses.
