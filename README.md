# CoDrive

CoDrive is a mobile-first road-trip app for planning a route with your crew, rotating drivers, and splitting costs. It runs in Expo Go and in the browser.

## Run

```bash
npm install
npm start
```

- Press `w` to open the web app at [http://localhost:8081](http://localhost:8081).
- Scan the QR code with Expo Go on a phone on the same network.

`npm run ios` and `npm run android` open the native simulators when they are installed.

## What you can do

- **Home.** Start a trip with a name, start, end, dates, and an optional picture. Open an expedition, tap the pencil to edit it, or tap the X to delete it. The profile picture starts as an anonymous icon; tap it to choose a photo or switch back.
- **Invite.** After you create a trip, share a link or QR code, then continue to Plan.
- **Plan.** Review proposed stops, like one, or suggest a new waypoint.
- **Drive.** Follow the route and today’s itinerary. The first visit opens a driver-rotation reminder. The bluetooth control opens the connection-lost notice.
- **Split.** See the shared budget and log an expense, including notes for who paid and whether it was split.

Sample trips load from `src/data.ts`. Changes stay in memory for the session.

## Where things live

`App.tsx` holds navigation and screen state. Screens are in `src/screens/`, shared pieces in `src/components/`, and colors in `src/theme.ts`.
