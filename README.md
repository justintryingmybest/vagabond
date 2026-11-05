# Vagabond

A social-first trip planner: plan trips by your preferences on a map, plan with friends, then publish the finished trip so others can fork it.

Product plan: [Vagabond: Product & Technical Plan](https://claude.ai/artifact/YBQZp4H9gTPvd5pUXsrwSw)

## Status

Early scaffold for the friend-group beta. iOS and web first.

What works now (on sample data, stored in memory):

- **Trips:** your upcoming and published trips
- **Trip detail:** days, stops on a simple route map, booking status and who owns each booking
- **Co-tripping:** skip a stop ("I'll skip this"), mark link-out bookings as booked, vote on options, and see who owes whom (people who skipped a stop don't pay for it)
- **Discover and fork:** browse published trips and fork one into your own editable copy, credited to the author
- **Profile:** travel preferences

Not built yet: sign-in and Supabase sync, real maps (Mapbox), AI trip drafting, recap images, and the real partner APIs. Places, excursions, and flights use mocks in `src/integrations/mock.ts` until the paid APIs are priced out.

## Run it

```bash
npm install
npm run web        # opens in the browser
npm run ios        # needs a Mac with Xcode, or scan the QR code with Expo Go on an iPhone
```

Checks:

```bash
npm test           # cost-splitting tests
npm run typecheck
```

## Layout

| Path | What's there |
| --- | --- |
| `src/app/` | Screens (Expo Router). `(tabs)/` holds Trips, Discover, Profile; `trip/[id].tsx` is the trip page |
| `src/lib/types.ts` | Domain model: Trip, Day, Stop, Booking, Vote, Expense |
| `src/lib/costs.ts` | Cost splitting and settle-up |
| `src/data/` | Sample data and the in-memory trip store |
| `src/integrations/` | Interfaces and mocks for places, excursions, flights |
| `supabase/migrations/` | Postgres schema for when the backend goes live |

## Stack

Expo (React Native) with Expo Router for iOS and web from one codebase. Supabase (Postgres + PostGIS) is the planned backend; Mapbox is the planned map.
